-- AI-Powered Insurance Data Ingestion Tables
-- This migration creates tables for automated insurance data feeds and AI processing

-- ============================================================
-- DATA SOURCES TABLE
-- Tracks external insurance data sources (APIs, aggregators, feeds, scrapers)
-- ============================================================
CREATE TABLE public.data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('api', 'aggregator', 'regulator', 'feed', 'scraper')),
  provider_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'disabled')),
  configuration JSONB NOT NULL DEFAULT '{}', -- API endpoints, credentials, scraping rules
  sync_frequency TEXT DEFAULT 'daily', -- daily, weekly, hourly, manual
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INGESTION JOBS TABLE
-- Tracks individual data ingestion job runs
-- ============================================================
CREATE TABLE public.ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id UUID REFERENCES public.data_sources(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  job_type TEXT NOT NULL CHECK (job_type IN ('scheduled', 'manual', 'webhook')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  products_found INTEGER DEFAULT 0,
  products_new INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  products_duplicates INTEGER DEFAULT 0,
  products_errors INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}', -- Additional job-specific data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INGESTION LOGS TABLE
-- Detailed logs for each product processed during ingestion
-- ============================================================
CREATE TABLE public.ingestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.ingestion_jobs(id) ON DELETE CASCADE NOT NULL,
  log_level TEXT NOT NULL CHECK (log_level IN ('info', 'warning', 'error', 'debug')),
  message TEXT NOT NULL,
  product_id UUID, -- Reference to product if applicable
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PRODUCT CATALOG TABLE
-- Stores insurance products from various sources
-- ============================================================
CREATE TABLE public.product_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id UUID REFERENCES public.data_sources(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT NOT NULL, -- Provider's product ID
  insurer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('health', 'auto', 'life', 'home', 'travel', 'pet', 'business', 'other')),

  -- Pricing information
  premium_amount DECIMAL(10,2),
  premium_frequency TEXT CHECK (premium_frequency IN ('monthly', 'annual', 'quarterly', 'one-time')),
  currency TEXT DEFAULT 'GBP',

  -- Coverage details
  coverage_summary TEXT,
  coverage_limits JSONB DEFAULT '{}', -- Structured coverage limits
  benefits TEXT[], -- Array of benefits
  exclusions TEXT[], -- Array of exclusions
  add_ons JSONB DEFAULT '[]', -- Available add-ons with pricing

  -- Product metadata
  product_url TEXT,
  document_url TEXT, -- Link to policy wording PDF
  contact_info JSONB DEFAULT '{}', -- Phone, email, address
  availability_regions TEXT[], -- Where product is available

  -- AI-processed fields
  ai_summary TEXT, -- AI-generated product summary
  ai_normalized_data JSONB DEFAULT '{}', -- Normalized comparison fields
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'outdated', 'archived')),
  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of UUID REFERENCES public.product_catalog(id) ON DELETE SET NULL,

  -- Timestamps
  last_verified_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(data_source_id, external_id)
);

-- ============================================================
-- PRODUCT VERSIONS TABLE
-- Track product changes over time for consistency monitoring
-- ============================================================
CREATE TABLE public.product_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.product_catalog(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  changes_detected JSONB NOT NULL DEFAULT '[]', -- Array of field changes
  premium_change DECIMAL(10,2), -- Change in premium amount
  change_type TEXT CHECK (change_type IN ('price_increase', 'price_decrease', 'coverage_change', 'terms_change', 'other')),
  snapshot_data JSONB NOT NULL DEFAULT '{}', -- Full product data snapshot
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- DUPLICATE DETECTIONS TABLE
-- Track detected duplicate products
-- ============================================================
CREATE TABLE public.duplicate_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.product_catalog(id) ON DELETE CASCADE NOT NULL,
  duplicate_product_id UUID REFERENCES public.product_catalog(id) ON DELETE CASCADE NOT NULL,
  similarity_score DECIMAL(5,2) NOT NULL, -- 0-100 similarity percentage
  matching_fields TEXT[] NOT NULL, -- Which fields matched
  ai_confidence DECIMAL(5,2), -- AI confidence in duplicate detection
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'false_positive', 'ignored')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure we don't create duplicate detection pairs
  UNIQUE(product_id, duplicate_product_id)
);

-- ============================================================
-- CONSISTENCY ALERTS TABLE
-- Track outdated or inconsistent products
-- ============================================================
CREATE TABLE public.consistency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.product_catalog(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('outdated', 'missing_data', 'stale_pricing', 'broken_link', 'verification_failed')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'ignored')),
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- Optimize query performance
-- ============================================================
CREATE INDEX idx_data_sources_status ON public.data_sources(status);
CREATE INDEX idx_data_sources_next_sync ON public.data_sources(next_sync_at) WHERE status = 'active';

CREATE INDEX idx_ingestion_jobs_source ON public.ingestion_jobs(data_source_id);
CREATE INDEX idx_ingestion_jobs_status ON public.ingestion_jobs(status);
CREATE INDEX idx_ingestion_jobs_created ON public.ingestion_jobs(created_at DESC);

CREATE INDEX idx_ingestion_logs_job ON public.ingestion_logs(job_id);
CREATE INDEX idx_ingestion_logs_level ON public.ingestion_logs(log_level);

CREATE INDEX idx_product_catalog_source ON public.product_catalog(data_source_id);
CREATE INDEX idx_product_catalog_insurer ON public.product_catalog(insurer_name);
CREATE INDEX idx_product_catalog_type ON public.product_catalog(policy_type);
CREATE INDEX idx_product_catalog_status ON public.product_catalog(status);
CREATE INDEX idx_product_catalog_duplicate ON public.product_catalog(is_duplicate);
CREATE INDEX idx_product_catalog_premium ON public.product_catalog(premium_amount);

CREATE INDEX idx_product_versions_product ON public.product_versions(product_id);
CREATE INDEX idx_product_versions_created ON public.product_versions(created_at DESC);

CREATE INDEX idx_duplicate_detections_product ON public.duplicate_detections(product_id);
CREATE INDEX idx_duplicate_detections_status ON public.duplicate_detections(status);

CREATE INDEX idx_consistency_alerts_product ON public.consistency_alerts(product_id);
CREATE INDEX idx_consistency_alerts_status ON public.consistency_alerts(status);
CREATE INDEX idx_consistency_alerts_severity ON public.consistency_alerts(severity);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Admin-only access for data ingestion management
-- ============================================================
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consistency_alerts ENABLE ROW LEVEL SECURITY;

-- Data sources: Admin read/write, service role full access
CREATE POLICY "Service role has full access to data sources"
  ON public.data_sources
  FOR ALL
  USING (true);

CREATE POLICY "Authenticated users can view data sources"
  ON public.data_sources
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Ingestion jobs: Service role full access, users can view
CREATE POLICY "Service role has full access to ingestion jobs"
  ON public.ingestion_jobs
  FOR ALL
  USING (true);

CREATE POLICY "Authenticated users can view ingestion jobs"
  ON public.ingestion_jobs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Ingestion logs: Service role full access, users can view
CREATE POLICY "Service role has full access to ingestion logs"
  ON public.ingestion_logs
  FOR ALL
  USING (true);

CREATE POLICY "Authenticated users can view ingestion logs"
  ON public.ingestion_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Product catalog: Public read access, service role can manage
CREATE POLICY "Anyone can view active products"
  ON public.product_catalog
  FOR SELECT
  USING (status = 'active' OR auth.role() = 'authenticated');

CREATE POLICY "Service role has full access to product catalog"
  ON public.product_catalog
  FOR ALL
  USING (true);

-- Product versions: Users can view, service role can manage
CREATE POLICY "Authenticated users can view product versions"
  ON public.product_versions
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role has full access to product versions"
  ON public.product_versions
  FOR ALL
  USING (true);

-- Duplicate detections: Users can view, service role can manage
CREATE POLICY "Authenticated users can view duplicate detections"
  ON public.duplicate_detections
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role has full access to duplicate detections"
  ON public.duplicate_detections
  FOR ALL
  USING (true);

-- Consistency alerts: Users can view, service role can manage
CREATE POLICY "Authenticated users can view consistency alerts"
  ON public.consistency_alerts
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role has full access to consistency alerts"
  ON public.consistency_alerts
  FOR ALL
  USING (true);

-- ============================================================
-- TRIGGERS
-- Auto-update timestamps
-- ============================================================
CREATE TRIGGER update_data_sources_updated_at
  BEFORE UPDATE ON public.data_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_catalog_updated_at
  BEFORE UPDATE ON public.product_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- FUNCTIONS
-- Helper functions for data ingestion
-- ============================================================

-- Function to create product version on update
CREATE OR REPLACE FUNCTION public.create_product_version()
RETURNS TRIGGER AS $$
DECLARE
  version_num INTEGER;
  changes JSONB := '[]'::JSONB;
  premium_diff DECIMAL(10,2);
  change_category TEXT;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO version_num
  FROM public.product_versions
  WHERE product_id = NEW.id;

  -- Detect changes
  IF OLD.premium_amount IS DISTINCT FROM NEW.premium_amount THEN
    changes := changes || jsonb_build_object(
      'field', 'premium_amount',
      'old_value', OLD.premium_amount,
      'new_value', NEW.premium_amount
    );
    premium_diff := NEW.premium_amount - OLD.premium_amount;

    IF premium_diff > 0 THEN
      change_category := 'price_increase';
    ELSE
      change_category := 'price_decrease';
    END IF;
  END IF;

  IF OLD.coverage_summary IS DISTINCT FROM NEW.coverage_summary THEN
    changes := changes || jsonb_build_object(
      'field', 'coverage_summary',
      'old_value', OLD.coverage_summary,
      'new_value', NEW.coverage_summary
    );
    change_category := COALESCE(change_category, 'coverage_change');
  END IF;

  IF OLD.benefits IS DISTINCT FROM NEW.benefits THEN
    changes := changes || jsonb_build_object(
      'field', 'benefits',
      'old_value', OLD.benefits,
      'new_value', NEW.benefits
    );
    change_category := COALESCE(change_category, 'coverage_change');
  END IF;

  IF OLD.exclusions IS DISTINCT FROM NEW.exclusions THEN
    changes := changes || jsonb_build_object(
      'field', 'exclusions',
      'old_value', OLD.exclusions,
      'new_value', NEW.exclusions
    );
    change_category := COALESCE(change_category, 'terms_change');
  END IF;

  -- Only create version if there are meaningful changes
  IF jsonb_array_length(changes) > 0 THEN
    INSERT INTO public.product_versions (
      product_id,
      version_number,
      changes_detected,
      premium_change,
      change_type,
      snapshot_data
    ) VALUES (
      NEW.id,
      version_num,
      changes,
      premium_diff,
      COALESCE(change_category, 'other'),
      to_jsonb(NEW)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to product_catalog
CREATE TRIGGER track_product_versions
  AFTER UPDATE ON public.product_catalog
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION public.create_product_version();

-- Function to update job statistics
CREATE OR REPLACE FUNCTION public.update_job_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be called to recalculate job statistics
  -- For now, it's a placeholder for future enhancements
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEED DATA (Optional - Example data sources)
-- ============================================================

-- Example: UK Financial Conduct Authority (FCA) feed
INSERT INTO public.data_sources (name, source_type, provider_name, configuration, sync_frequency)
VALUES (
  'FCA Insurance Products Register',
  'regulator',
  'Financial Conduct Authority',
  '{"api_endpoint": "https://register.fca.org.uk/", "api_key_required": false}'::JSONB,
  'weekly'
);

-- Example: Insurance aggregator
INSERT INTO public.data_sources (name, source_type, provider_name, configuration, sync_frequency)
VALUES (
  'MoneySuperMarket API',
  'aggregator',
  'MoneySuperMarket',
  '{"api_endpoint": "https://api.moneysupermarket.com/", "requires_auth": true}'::JSONB,
  'daily'
);

-- Example: Web scraper
INSERT INTO public.data_sources (name, source_type, provider_name, configuration, sync_frequency)
VALUES (
  'Direct Line Products Scraper',
  'scraper',
  'Direct Line',
  '{"target_url": "https://www.directline.com/insurance/", "scrape_rules": {"selector": ".product-card"}}'::JSONB,
  'daily'
);
