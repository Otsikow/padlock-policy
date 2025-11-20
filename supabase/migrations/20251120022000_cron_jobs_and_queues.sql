-- =====================================================
-- CRON JOBS AND BACKGROUND QUEUES
-- This migration sets up:
-- 1. Background job queue table
-- 2. Cron job for daily AI crawls
-- 3. PDF extraction queue
-- =====================================================

-- =====================================================
-- 1. CREATE JOB QUEUE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Job details
  job_type TEXT NOT NULL, -- 'ai_crawl', 'pdf_extraction', 'email_notification', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  priority INTEGER DEFAULT 0, -- Higher priority jobs run first

  -- Job data
  payload JSONB NOT NULL,
  result JSONB,
  error_message TEXT,

  -- Retry logic
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Worker information
  worker_id TEXT,
  locked_until TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can access job queue
CREATE POLICY "Service can manage job queue"
  ON public.job_queue
  FOR ALL
  USING (true);

-- Create indexes for job queue
CREATE INDEX IF NOT EXISTS idx_job_queue_status ON public.job_queue(status);
CREATE INDEX IF NOT EXISTS idx_job_queue_type ON public.job_queue(job_type);
CREATE INDEX IF NOT EXISTS idx_job_queue_priority ON public.job_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_job_queue_next_retry ON public.job_queue(next_retry_at);
CREATE INDEX IF NOT EXISTS idx_job_queue_created_at ON public.job_queue(created_at);

-- =====================================================
-- 2. CREATE FUNCTIONS FOR JOB QUEUE MANAGEMENT
-- =====================================================

-- Function to enqueue a job
CREATE OR REPLACE FUNCTION public.enqueue_job(
  job_type_val TEXT,
  payload_val JSONB,
  priority_val INTEGER DEFAULT 0,
  max_attempts_val INTEGER DEFAULT 3
)
RETURNS UUID AS $$
DECLARE
  job_id UUID;
BEGIN
  INSERT INTO public.job_queue (job_type, payload, priority, max_attempts)
  VALUES (job_type_val, payload_val, priority_val, max_attempts_val)
  RETURNING id INTO job_id;

  RETURN job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get next job from queue
CREATE OR REPLACE FUNCTION public.get_next_job(worker_id_val TEXT, lock_duration_minutes INTEGER DEFAULT 5)
RETURNS TABLE (
  job_id UUID,
  job_type TEXT,
  payload JSONB,
  attempts INTEGER
) AS $$
DECLARE
  selected_job RECORD;
BEGIN
  -- Find and lock the next available job
  SELECT id, job_queue.job_type, job_queue.payload, job_queue.attempts
  INTO selected_job
  FROM public.job_queue
  WHERE status = 'pending'
    AND attempts < max_attempts
    AND (next_retry_at IS NULL OR next_retry_at <= now())
    AND (locked_until IS NULL OR locked_until < now())
  ORDER BY priority DESC, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF selected_job.id IS NOT NULL THEN
    -- Lock the job
    UPDATE public.job_queue
    SET
      status = 'processing',
      worker_id = worker_id_val,
      locked_until = now() + (lock_duration_minutes || ' minutes')::interval,
      started_at = CASE WHEN started_at IS NULL THEN now() ELSE started_at END,
      attempts = attempts + 1
    WHERE id = selected_job.id;

    -- Return the job
    RETURN QUERY SELECT selected_job.id, selected_job.job_type, selected_job.payload, selected_job.attempts;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark job as completed
CREATE OR REPLACE FUNCTION public.complete_job(
  job_id_val UUID,
  result_val JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.job_queue
  SET
    status = 'completed',
    result = result_val,
    completed_at = now(),
    locked_until = NULL
  WHERE id = job_id_val;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark job as failed
CREATE OR REPLACE FUNCTION public.fail_job(
  job_id_val UUID,
  error_message_val TEXT,
  retry_delay_minutes INTEGER DEFAULT 5
)
RETURNS BOOLEAN AS $$
DECLARE
  current_attempts INTEGER;
  current_max_attempts INTEGER;
BEGIN
  SELECT attempts, max_attempts INTO current_attempts, current_max_attempts
  FROM public.job_queue
  WHERE id = job_id_val;

  IF current_attempts >= current_max_attempts THEN
    -- Max attempts reached, mark as failed permanently
    UPDATE public.job_queue
    SET
      status = 'failed',
      error_message = error_message_val,
      completed_at = now(),
      locked_until = NULL
    WHERE id = job_id_val;
  ELSE
    -- Schedule retry
    UPDATE public.job_queue
    SET
      status = 'pending',
      error_message = error_message_val,
      next_retry_at = now() + (retry_delay_minutes * (current_attempts + 1) || ' minutes')::interval,
      locked_until = NULL
    WHERE id = job_id_val;
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. FUNCTION TO CRAWL INSURANCE PRODUCTS
-- =====================================================

CREATE OR REPLACE FUNCTION public.schedule_daily_ai_crawls()
RETURNS INTEGER AS $$
DECLARE
  company_record RECORD;
  crawl_count INTEGER := 0;
BEGIN
  -- Schedule AI crawls for all active insurance companies
  FOR company_record IN
    SELECT id, name, website
    FROM public.insurance_companies
    WHERE is_active = true AND website IS NOT NULL
  LOOP
    -- Enqueue a job to crawl this company's products
    PERFORM public.enqueue_job(
      'ai_crawl',
      jsonb_build_object(
        'company_id', company_record.id,
        'company_name', company_record.name,
        'website', company_record.website,
        'scheduled_at', now()
      ),
      0, -- priority
      3  -- max attempts
    );

    crawl_count := crawl_count + 1;
  END LOOP;

  -- Also schedule crawls for products that haven't been updated in 7+ days
  FOR company_record IN
    SELECT DISTINCT company_id
    FROM public.insurance_products
    WHERE last_crawled_at < now() - interval '7 days'
       OR last_crawled_at IS NULL
  LOOP
    PERFORM public.enqueue_job(
      'product_refresh',
      jsonb_build_object(
        'company_id', company_record.company_id,
        'scheduled_at', now()
      ),
      5, -- higher priority
      3
    );

    crawl_count := crawl_count + 1;
  END LOOP;

  RETURN crawl_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. FUNCTION TO PROCESS PDF EXTRACTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.enqueue_pdf_extraction(
  document_id_val UUID,
  file_url_val TEXT,
  priority_val INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  job_id UUID;
BEGIN
  -- Enqueue PDF extraction job
  SELECT public.enqueue_job(
    'pdf_extraction',
    jsonb_build_object(
      'document_id', document_id_val,
      'file_url', file_url_val,
      'scheduled_at', now()
    ),
    priority_val,
    3 -- max attempts
  ) INTO job_id;

  RETURN job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. TRIGGER TO AUTO-ENQUEUE PDF EXTRACTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.auto_enqueue_pdf_extraction()
RETURNS TRIGGER AS $$
BEGIN
  -- If a new document is uploaded and it's a PDF, enqueue extraction
  IF NEW.file_url LIKE '%.pdf' OR NEW.file_url LIKE '%.PDF' THEN
    PERFORM public.enqueue_pdf_extraction(
      NEW.id,
      NEW.file_url,
      CASE WHEN NEW.document_type = 'policy' THEN 10 ELSE 5 END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_pdf_extraction ON public.documents;
CREATE TRIGGER trigger_auto_pdf_extraction
  AFTER INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_enqueue_pdf_extraction();

-- =====================================================
-- 6. CLEANUP FUNCTION FOR OLD JOBS
-- =====================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_jobs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete completed jobs older than 30 days
  DELETE FROM public.job_queue
  WHERE status = 'completed'
    AND completed_at < now() - interval '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Delete failed jobs older than 90 days
  DELETE FROM public.job_queue
  WHERE status = 'failed'
    AND completed_at < now() - interval '90 days';

  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. ENABLE pg_cron EXTENSION AND SCHEDULE JOBS
-- =====================================================

-- Note: pg_cron must be enabled by a superuser
-- Run this manually in your Supabase dashboard or with superuser access:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily AI crawls at 2 AM UTC
-- SELECT cron.schedule(
--   'daily-ai-crawls',
--   '0 2 * * *',
--   'SELECT public.schedule_daily_ai_crawls();'
-- );

-- Schedule cleanup of old jobs weekly on Sunday at 3 AM UTC
-- SELECT cron.schedule(
--   'weekly-job-cleanup',
--   '0 3 * * 0',
--   'SELECT public.cleanup_old_jobs();'
-- );

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.job_queue IS 'Background job queue for async processing (PDF extraction, AI crawls, etc.)';
COMMENT ON FUNCTION public.enqueue_job IS 'Adds a new job to the queue';
COMMENT ON FUNCTION public.get_next_job IS 'Gets next job from queue and locks it for processing';
COMMENT ON FUNCTION public.schedule_daily_ai_crawls IS 'Scheduled daily to crawl insurance company websites for new products';
COMMENT ON FUNCTION public.enqueue_pdf_extraction IS 'Enqueues a PDF document for text extraction';
COMMENT ON FUNCTION public.cleanup_old_jobs IS 'Removes old completed/failed jobs from the queue';
