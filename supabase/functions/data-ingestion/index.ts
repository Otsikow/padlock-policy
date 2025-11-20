import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IngestionRequest {
  action: 'start_ingestion' | 'get_job_status' | 'list_sources' | 'cancel_job';
  data_source_id?: string;
  job_id?: string;
  job_type?: 'scheduled' | 'manual' | 'webhook';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data_source_id, job_id, job_type }: IngestionRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case 'start_ingestion': {
        if (!data_source_id) {
          throw new Error('data_source_id is required for start_ingestion');
        }

        // Get data source configuration
        const { data: dataSource, error: sourceError } = await supabase
          .from('data_sources')
          .select('*')
          .eq('id', data_source_id)
          .single();

        if (sourceError || !dataSource) {
          throw new Error(`Data source not found: ${sourceError?.message}`);
        }

        if (dataSource.status !== 'active') {
          throw new Error(`Data source is not active: ${dataSource.status}`);
        }

        // Create ingestion job
        const { data: job, error: jobError } = await supabase
          .from('ingestion_jobs')
          .insert({
            data_source_id,
            status: 'pending',
            job_type: job_type || 'manual',
            started_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (jobError) {
          throw new Error(`Failed to create job: ${jobError.message}`);
        }

        // Log job creation
        await supabase.from('ingestion_logs').insert({
          job_id: job.id,
          log_level: 'info',
          message: `Ingestion job created for data source: ${dataSource.name}`,
          details: { data_source: dataSource },
        });

        // Start ingestion process based on source type
        const result = await processIngestion(supabase, job, dataSource);

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_job_status': {
        if (!job_id) {
          throw new Error('job_id is required for get_job_status');
        }

        const { data: job, error } = await supabase
          .from('ingestion_jobs')
          .select(`
            *,
            data_sources (
              name,
              provider_name,
              source_type
            )
          `)
          .eq('id', job_id)
          .single();

        if (error) {
          throw new Error(`Job not found: ${error.message}`);
        }

        // Get recent logs
        const { data: logs } = await supabase
          .from('ingestion_logs')
          .select('*')
          .eq('job_id', job_id)
          .order('created_at', { ascending: false })
          .limit(50);

        return new Response(JSON.stringify({ job, logs }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list_sources': {
        const { data: sources, error } = await supabase
          .from('data_sources')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch sources: ${error.message}`);
        }

        return new Response(JSON.stringify({ sources }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'cancel_job': {
        if (!job_id) {
          throw new Error('job_id is required for cancel_job');
        }

        const { error } = await supabase
          .from('ingestion_jobs')
          .update({ status: 'cancelled', completed_at: new Date().toISOString() })
          .eq('id', job_id)
          .eq('status', 'running'); // Only cancel running jobs

        if (error) {
          throw new Error(`Failed to cancel job: ${error.message}`);
        }

        return new Response(JSON.stringify({ message: 'Job cancelled successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in data ingestion:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processIngestion(supabase: any, job: any, dataSource: any) {
  try {
    // Update job status to running
    await supabase
      .from('ingestion_jobs')
      .update({ status: 'running' })
      .eq('id', job.id);

    let stats = {
      products_found: 0,
      products_new: 0,
      products_updated: 0,
      products_duplicates: 0,
      products_errors: 0,
    };

    // Process based on source type
    switch (dataSource.source_type) {
      case 'api':
        stats = await processAPISource(supabase, job, dataSource);
        break;
      case 'scraper':
        stats = await processScraperSource(supabase, job, dataSource);
        break;
      case 'feed':
        stats = await processFeedSource(supabase, job, dataSource);
        break;
      case 'aggregator':
        stats = await processAggregatorSource(supabase, job, dataSource);
        break;
      case 'regulator':
        stats = await processRegulatorSource(supabase, job, dataSource);
        break;
      default:
        throw new Error(`Unsupported source type: ${dataSource.source_type}`);
    }

    // Update job with completion status
    await supabase
      .from('ingestion_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        ...stats,
      })
      .eq('id', job.id);

    // Update data source last sync time
    await supabase
      .from('data_sources')
      .update({
        last_sync_at: new Date().toISOString(),
        error_count: 0,
        last_error: null,
      })
      .eq('id', dataSource.id);

    await supabase.from('ingestion_logs').insert({
      job_id: job.id,
      log_level: 'info',
      message: `Ingestion completed successfully`,
      details: { stats },
    });

    return { success: true, job_id: job.id, stats };

  } catch (error) {
    // Update job with error status
    await supabase
      .from('ingestion_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message,
      })
      .eq('id', job.id);

    // Update data source error count
    await supabase
      .from('data_sources')
      .update({
        error_count: dataSource.error_count + 1,
        last_error: error.message,
      })
      .eq('id', dataSource.id);

    await supabase.from('ingestion_logs').insert({
      job_id: job.id,
      log_level: 'error',
      message: `Ingestion failed: ${error.message}`,
      details: { error: error.toString() },
    });

    throw error;
  }
}

async function processAPISource(supabase: any, job: any, dataSource: any) {
  const config = dataSource.configuration;
  const stats = {
    products_found: 0,
    products_new: 0,
    products_updated: 0,
    products_duplicates: 0,
    products_errors: 0,
  };

  try {
    // Make API request
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (config.api_key) {
      headers['Authorization'] = `Bearer ${config.api_key}`;
    }

    const response = await fetch(config.api_endpoint, {
      headers,
      method: config.method || 'GET',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const products = Array.isArray(data) ? data : data.products || data.results || [];

    stats.products_found = products.length;

    // Process each product
    for (const productData of products) {
      try {
        const result = await processProduct(supabase, job, dataSource, productData);
        if (result.is_new) stats.products_new++;
        if (result.is_updated) stats.products_updated++;
        if (result.is_duplicate) stats.products_duplicates++;
      } catch (error) {
        stats.products_errors++;
        await supabase.from('ingestion_logs').insert({
          job_id: job.id,
          log_level: 'error',
          message: `Failed to process product: ${error.message}`,
          details: { product: productData, error: error.toString() },
        });
      }
    }

  } catch (error) {
    throw new Error(`API source processing failed: ${error.message}`);
  }

  return stats;
}

async function processScraperSource(supabase: any, job: any, dataSource: any) {
  const stats = {
    products_found: 0,
    products_new: 0,
    products_updated: 0,
    products_duplicates: 0,
    products_errors: 0,
  };

  // Call the scrape-product-page function
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const response = await fetch(`${supabaseUrl}/functions/v1/scrape-product-page`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: dataSource.configuration.target_url,
      scrape_rules: dataSource.configuration.scrape_rules,
    }),
  });

  if (!response.ok) {
    throw new Error(`Scraping failed: ${response.statusText}`);
  }

  const { products } = await response.json();
  stats.products_found = products.length;

  // Process each scraped product
  for (const productData of products) {
    try {
      const result = await processProduct(supabase, job, dataSource, productData);
      if (result.is_new) stats.products_new++;
      if (result.is_updated) stats.products_updated++;
      if (result.is_duplicate) stats.products_duplicates++;
    } catch (error) {
      stats.products_errors++;
    }
  }

  return stats;
}

async function processFeedSource(supabase: any, job: any, dataSource: any) {
  // Similar to API source but for RSS/Atom feeds
  return processAPISource(supabase, job, dataSource);
}

async function processAggregatorSource(supabase: any, job: any, dataSource: any) {
  // Similar to API source but with aggregator-specific logic
  return processAPISource(supabase, job, dataSource);
}

async function processRegulatorSource(supabase: any, job: any, dataSource: any) {
  // Similar to API source but with regulator-specific logic
  return processAPISource(supabase, job, dataSource);
}

async function processProduct(supabase: any, job: any, dataSource: any, productData: any) {
  let is_new = false;
  let is_updated = false;
  let is_duplicate = false;

  // Check if product already exists
  const { data: existingProduct } = await supabase
    .from('product_catalog')
    .select('*')
    .eq('data_source_id', dataSource.id)
    .eq('external_id', productData.external_id || productData.id)
    .single();

  // Normalize product data using AI
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const normalizeResponse = await fetch(`${supabaseUrl}/functions/v1/normalize-product`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product: productData }),
  });

  const normalizedData = await normalizeResponse.json();

  const productRecord = {
    data_source_id: dataSource.id,
    external_id: productData.external_id || productData.id,
    insurer_name: normalizedData.insurer_name || productData.insurer_name,
    product_name: normalizedData.product_name || productData.product_name,
    policy_type: normalizedData.policy_type || productData.policy_type,
    premium_amount: normalizedData.premium_amount,
    premium_frequency: normalizedData.premium_frequency,
    currency: normalizedData.currency || 'GBP',
    coverage_summary: normalizedData.coverage_summary,
    coverage_limits: normalizedData.coverage_limits,
    benefits: normalizedData.benefits,
    exclusions: normalizedData.exclusions,
    add_ons: normalizedData.add_ons,
    product_url: productData.product_url,
    document_url: productData.document_url,
    contact_info: normalizedData.contact_info,
    availability_regions: normalizedData.availability_regions,
    ai_summary: normalizedData.ai_summary,
    ai_normalized_data: normalizedData,
    status: 'active',
    last_verified_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString(),
  };

  if (existingProduct) {
    // Update existing product
    await supabase
      .from('product_catalog')
      .update(productRecord)
      .eq('id', existingProduct.id);
    is_updated = true;
  } else {
    // Insert new product
    const { data: newProduct } = await supabase
      .from('product_catalog')
      .insert(productRecord)
      .select()
      .single();
    is_new = true;

    // Check for duplicates
    const duplicateResponse = await fetch(`${supabaseUrl}/functions/v1/detect-duplicates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: newProduct.id }),
    });

    const { duplicates } = await duplicateResponse.json();
    if (duplicates && duplicates.length > 0) {
      is_duplicate = true;
    }
  }

  return { is_new, is_updated, is_duplicate };
}
