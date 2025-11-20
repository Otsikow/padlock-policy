import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a unique worker ID
const WORKER_ID = `worker_${Date.now()}_${Math.random().toString(36).substring(7)}`;

// PDF text extraction function (same as analyze-policy)
async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  try {
    console.log('Extracting text from PDF:', pdfUrl);

    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false });
    const pdfString = decoder.decode(uint8Array);

    let extractedText = '';

    // Extract text from PDF
    const textPatterns = [
      /\((.*?)\)/g,
      /\[(.*?)\]/g,
      /BT\s*(.*?)\s*ET/gs,
    ];

    textPatterns.forEach(pattern => {
      const matches = pdfString.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/[()[\]BT ET]/g, '').trim();
          if (cleaned.length > 3 && /[a-zA-Z]/.test(cleaned)) {
            extractedText += cleaned + ' ';
          }
        });
      }
    });

    if (extractedText.length < 100) {
      const readableText = pdfString
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .split(' ')
        .filter(word => word.length > 2 && /[a-zA-Z]/.test(word))
        .join(' ');

      if (readableText.length > extractedText.length) {
        extractedText = readableText;
      }
    }

    return extractedText.substring(0, 8000);

  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

// Process PDF extraction job
async function processPdfExtraction(supabase: any, payload: any): Promise<any> {
  const { document_id, file_url } = payload;

  console.log('Processing PDF extraction for document:', document_id);

  const extractedText = await extractTextFromPDF(file_url);

  // Store extracted text (you might want to add a text_content column to documents table)
  // For now, we'll just return it as result
  return {
    document_id,
    text_length: extractedText.length,
    extracted_text: extractedText.substring(0, 1000), // Store first 1000 chars as preview
    success: true
  };
}

// Process AI crawl job
async function processAiCrawl(supabase: any, payload: any, openAIApiKey: string): Promise<any> {
  const { company_id, company_name, website } = payload;

  console.log('Processing AI crawl for company:', company_name);

  // This is a simplified version - in production, you would:
  // 1. Crawl the company website
  // 2. Find product pages
  // 3. Extract product information
  // 4. Create/update products in database

  // For now, just call the ai-product-ingest endpoint
  const ingestUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-product-ingest`;

  const response = await fetch(ingestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-secret': Deno.env.get('WEBHOOK_SECRET') || ''
    },
    body: JSON.stringify({
      source_url: website,
      company_name: company_name
    })
  });

  const result = await response.json();

  return {
    company_id,
    company_name,
    crawl_result: result,
    success: response.ok
  };
}

// Process product refresh job
async function processProductRefresh(supabase: any, payload: any): Promise<any> {
  const { company_id } = payload;

  console.log('Processing product refresh for company:', company_id);

  // Update last_crawled_at for all products of this company
  const { data, error } = await supabase
    .from('insurance_products')
    .update({ last_crawled_at: new Date().toISOString() })
    .eq('company_id', company_id)
    .select();

  if (error) {
    throw error;
  }

  return {
    company_id,
    products_updated: data?.length || 0,
    success: true
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Worker ${WORKER_ID} starting...`);

    // Get next job from queue
    const { data: jobs, error: jobError } = await supabase
      .rpc('get_next_job', {
        worker_id_val: WORKER_ID,
        lock_duration_minutes: 5
      });

    if (jobError) {
      throw jobError;
    }

    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No jobs available',
          worker_id: WORKER_ID
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const job = jobs[0];
    console.log(`Processing job ${job.job_id} of type ${job.job_type}`);

    let result;
    let success = true;
    let errorMessage = null;

    try {
      // Process job based on type
      switch (job.job_type) {
        case 'pdf_extraction':
          result = await processPdfExtraction(supabase, job.payload);
          break;

        case 'ai_crawl':
          if (!openAIApiKey) {
            throw new Error('OpenAI API key not configured');
          }
          result = await processAiCrawl(supabase, job.payload, openAIApiKey);
          break;

        case 'product_refresh':
          result = await processProductRefresh(supabase, job.payload);
          break;

        default:
          throw new Error(`Unknown job type: ${job.job_type}`);
      }

      // Mark job as completed
      await supabase.rpc('complete_job', {
        job_id_val: job.job_id,
        result_val: result
      });

      console.log(`Job ${job.job_id} completed successfully`);

    } catch (error) {
      success = false;
      errorMessage = error.message;

      // Mark job as failed
      await supabase.rpc('fail_job', {
        job_id_val: job.job_id,
        error_message_val: errorMessage,
        retry_delay_minutes: 5
      });

      console.error(`Job ${job.job_id} failed:`, errorMessage);
    }

    return new Response(
      JSON.stringify({
        success,
        worker_id: WORKER_ID,
        job_id: job.job_id,
        job_type: job.job_type,
        result: result || null,
        error: errorMessage
      }),
      {
        status: success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in job-worker function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
        worker_id: WORKER_ID
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
