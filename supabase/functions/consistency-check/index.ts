import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, product_id } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let alerts: any[] = [];

    if (action === 'check_all') {
      // Check all active products
      const { data: products } = await supabase
        .from('product_catalog')
        .select('*')
        .eq('status', 'active');

      if (products) {
        for (const product of products) {
          const productAlerts = await checkProductConsistency(supabase, product);
          alerts.push(...productAlerts);
        }
      }
    } else if (action === 'check_product' && product_id) {
      // Check specific product
      const { data: product } = await supabase
        .from('product_catalog')
        .select('*')
        .eq('id', product_id)
        .single();

      if (product) {
        alerts = await checkProductConsistency(supabase, product);
      }
    } else {
      throw new Error('Invalid action or missing product_id');
    }

    return new Response(JSON.stringify({
      alerts,
      count: alerts.length,
      critical_count: alerts.filter((a: any) => a.severity === 'critical').length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in consistency-check:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkProductConsistency(supabase: any, product: any): Promise<any[]> {
  const alerts: any[] = [];

  // Check 1: Outdated products (not verified in 30+ days)
  const lastVerified = new Date(product.last_verified_at || product.created_at);
  const daysSinceVerification = (Date.now() - lastVerified.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceVerification > 30) {
    const alert = await createAlert(supabase, product.id, {
      alert_type: 'outdated',
      severity: daysSinceVerification > 90 ? 'critical' : daysSinceVerification > 60 ? 'high' : 'medium',
      message: `Product not verified in ${Math.floor(daysSinceVerification)} days`,
      details: {
        last_verified_at: product.last_verified_at,
        days_since_verification: Math.floor(daysSinceVerification),
      },
    });
    alerts.push(alert);
  }

  // Check 2: Missing critical data
  const missingFields: string[] = [];
  if (!product.premium_amount) missingFields.push('premium_amount');
  if (!product.coverage_summary) missingFields.push('coverage_summary');
  if (!product.benefits || product.benefits.length === 0) missingFields.push('benefits');
  if (!product.product_url && !product.document_url) missingFields.push('product_url or document_url');

  if (missingFields.length > 0) {
    const alert = await createAlert(supabase, product.id, {
      alert_type: 'missing_data',
      severity: missingFields.length > 2 ? 'high' : 'medium',
      message: `Missing critical data fields: ${missingFields.join(', ')}`,
      details: { missing_fields: missingFields },
    });
    alerts.push(alert);
  }

  // Check 3: Stale pricing (check against current market)
  if (product.premium_amount) {
    const pricingAlert = await checkPricingConsistency(supabase, product);
    if (pricingAlert) alerts.push(pricingAlert);
  }

  // Check 4: Broken links
  if (product.product_url) {
    const linkAlert = await checkProductLink(supabase, product);
    if (linkAlert) alerts.push(linkAlert);
  }

  // Check 5: Verification failures (if product has errors)
  if (product.last_error) {
    const alert = await createAlert(supabase, product.id, {
      alert_type: 'verification_failed',
      severity: 'high',
      message: `Last verification failed: ${product.last_error}`,
      details: { error: product.last_error },
    });
    alerts.push(alert);
  }

  return alerts;
}

async function createAlert(supabase: any, product_id: string, alertData: any): Promise<any> {
  // Check if similar alert already exists and is active
  const { data: existing } = await supabase
    .from('consistency_alerts')
    .select('*')
    .eq('product_id', product_id)
    .eq('alert_type', alertData.alert_type)
    .eq('status', 'active')
    .single();

  if (existing) {
    // Update existing alert
    const { data: updated } = await supabase
      .from('consistency_alerts')
      .update({
        message: alertData.message,
        details: alertData.details,
        severity: alertData.severity,
      })
      .eq('id', existing.id)
      .select()
      .single();
    return updated;
  }

  // Create new alert
  const { data: newAlert } = await supabase
    .from('consistency_alerts')
    .insert({
      product_id,
      ...alertData,
      status: 'active',
    })
    .select()
    .single();

  return newAlert;
}

async function checkPricingConsistency(supabase: any, product: any): Promise<any | null> {
  // Get similar products from the same insurer
  const { data: similarProducts } = await supabase
    .from('product_catalog')
    .select('premium_amount')
    .eq('insurer_name', product.insurer_name)
    .eq('policy_type', product.policy_type)
    .eq('status', 'active')
    .neq('id', product.id);

  if (!similarProducts || similarProducts.length < 2) {
    return null; // Not enough data to compare
  }

  // Calculate average premium
  const premiums = similarProducts
    .map((p: any) => p.premium_amount)
    .filter((p: number) => p > 0);

  if (premiums.length === 0) return null;

  const avgPremium = premiums.reduce((a: number, b: number) => a + b, 0) / premiums.length;
  const deviation = Math.abs(product.premium_amount - avgPremium) / avgPremium;

  // Alert if pricing is more than 50% different from average
  if (deviation > 0.5) {
    return await createAlert(supabase, product.id, {
      alert_type: 'stale_pricing',
      severity: deviation > 1.0 ? 'high' : 'medium',
      message: `Pricing ${deviation > 0 ? 'significantly higher' : 'lower'} than similar products (${Math.round(deviation * 100)}% deviation)`,
      details: {
        product_premium: product.premium_amount,
        average_premium: avgPremium,
        deviation_percentage: Math.round(deviation * 100),
      },
    });
  }

  return null;
}

async function checkProductLink(supabase: any, product: any): Promise<any | null> {
  try {
    // Try to fetch the product URL
    const response = await fetch(product.product_url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PadlockPolicyBot/1.0)',
      },
    });

    if (!response.ok) {
      return await createAlert(supabase, product.id, {
        alert_type: 'broken_link',
        severity: 'medium',
        message: `Product URL returned ${response.status}: ${response.statusText}`,
        details: {
          url: product.product_url,
          status_code: response.status,
          status_text: response.statusText,
        },
      });
    }

    // Check if redirected to a different domain
    if (response.url !== product.product_url) {
      const originalDomain = new URL(product.product_url).hostname;
      const newDomain = new URL(response.url).hostname;

      if (originalDomain !== newDomain) {
        return await createAlert(supabase, product.id, {
          alert_type: 'broken_link',
          severity: 'low',
          message: `Product URL redirects to different domain`,
          details: {
            original_url: product.product_url,
            redirect_url: response.url,
          },
        });
      }
    }

    return null;
  } catch (error) {
    return await createAlert(supabase, product.id, {
      alert_type: 'broken_link',
      severity: 'high',
      message: `Failed to access product URL: ${error.message}`,
      details: {
        url: product.product_url,
        error: error.toString(),
      },
    });
  }
}
