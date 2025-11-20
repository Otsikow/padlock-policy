import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Scheduled Ingestion Function
 *
 * This function is designed to be triggered by Supabase's cron scheduler or manually.
 * It checks for data sources that are due for synchronization and triggers ingestion jobs.
 *
 * To set up the cron schedule in Supabase:
 * 1. Go to Database > Extensions > Enable pg_cron
 * 2. Run this SQL to schedule the function:
 *
 * SELECT cron.schedule(
 *   'scheduled-data-ingestion',
 *   '0 */6 * * *', -- Run every 6 hours
 *   $$
 *   SELECT
 *     net.http_post(
 *       url := 'https://[YOUR-PROJECT-REF].supabase.co/functions/v1/scheduled-ingestion',
 *       headers := '{"Content-Type": "application/json", "Authorization": "Bearer [SERVICE-ROLE-KEY]"}'::jsonb,
 *       body := '{}'::jsonb
 *     ) as request_id;
 *   $$
 * );
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting scheduled ingestion check...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get active data sources that are due for sync
    const now = new Date();
    const { data: sourcesDue, error: sourcesError } = await supabase
      .from('data_sources')
      .select('*')
      .eq('status', 'active')
      .or(`next_sync_at.is.null,next_sync_at.lte.${now.toISOString()}`);

    if (sourcesError) {
      throw new Error(`Failed to fetch data sources: ${sourcesError.message}`);
    }

    if (!sourcesDue || sourcesDue.length === 0) {
      console.log('No data sources due for synchronization');
      return new Response(JSON.stringify({
        message: 'No data sources due for synchronization',
        sources_checked: 0,
        jobs_started: 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${sourcesDue.length} data sources due for sync`);

    const results = [];

    // Start ingestion for each source
    for (const source of sourcesDue) {
      try {
        console.log(`Starting ingestion for source: ${source.name}`);

        // Call the data-ingestion function
        const response = await fetch(`${supabaseUrl}/functions/v1/data-ingestion`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'start_ingestion',
            data_source_id: source.id,
            job_type: 'scheduled',
          }),
        });

        if (response.ok) {
          const result = await response.json();
          results.push({
            source_id: source.id,
            source_name: source.name,
            success: true,
            job_id: result.job_id,
          });

          // Update next sync time based on frequency
          const nextSync = calculateNextSyncTime(source.sync_frequency);
          await supabase
            .from('data_sources')
            .update({ next_sync_at: nextSync.toISOString() })
            .eq('id', source.id);

          console.log(`Successfully started ingestion for ${source.name}`);
        } else {
          const errorText = await response.text();
          results.push({
            source_id: source.id,
            source_name: source.name,
            success: false,
            error: errorText,
          });
          console.error(`Failed to start ingestion for ${source.name}: ${errorText}`);
        }
      } catch (error) {
        results.push({
          source_id: source.id,
          source_name: source.name,
          success: false,
          error: error.message,
        });
        console.error(`Error processing source ${source.name}:`, error);
      }
    }

    const successCount = results.filter(r => r.success).length;

    console.log(`Scheduled ingestion complete. Started ${successCount}/${sourcesDue.length} jobs`);

    return new Response(JSON.stringify({
      message: 'Scheduled ingestion complete',
      sources_checked: sourcesDue.length,
      jobs_started: successCount,
      results,
      timestamp: now.toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scheduled-ingestion:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateNextSyncTime(frequency: string): Date {
  const now = new Date();

  switch (frequency) {
    case 'hourly':
      now.setHours(now.getHours() + 1);
      break;
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    default:
      // Default to daily
      now.setDate(now.getDate() + 1);
  }

  return now;
}
