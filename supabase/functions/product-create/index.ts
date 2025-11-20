import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { productCreateBodySchema, validateJsonBody, createValidationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get API key from headers
    const apiKey = req.headers.get('x-api-key');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required. Please include x-api-key header.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify API key and get company
    const { data: company, error: companyError } = await supabase
      .from('insurance_companies')
      .select('id, name, is_active')
      .eq('api_key', apiKey)
      .single();

    if (companyError || !company) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!company.is_active) {
      return new Response(
        JSON.stringify({ error: 'Company account is not active' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check rate limit
    const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
      identifier_val: company.id,
      endpoint_val: 'product-create',
      max_requests: 100,
      window_minutes: 60
    });

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate request body
    const validationResult = await validateJsonBody(req, productCreateBodySchema);
    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.errors!, corsHeaders);
    }

    const productData = validationResult.data;

    // Create product
    const { data: newProduct, error: insertError } = await supabase
      .from('insurance_products')
      .insert({
        company_id: company.id,
        product_name: productData.product_name,
        product_code: productData.product_code,
        policy_type: productData.policy_type,
        description: productData.description,
        coverage_details: productData.coverage_details,
        premium_amount: productData.premium_amount,
        currency: productData.currency || 'GBP',
        billing_frequency: productData.billing_frequency || 'monthly',
        coverage_limits: productData.coverage_limits,
        deductible: productData.deductible,
        benefits: productData.benefits,
        exclusions: productData.exclusions,
        available_countries: productData.available_countries,
        minimum_age: productData.minimum_age,
        maximum_age: productData.maximum_age,
        product_image_url: productData.product_image_url,
        brochure_url: productData.brochure_url,
        terms_url: productData.terms_url,
        search_keywords: productData.search_keywords,
        ai_tags: productData.ai_tags,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating product:', insertError);
      return new Response(
        JSON.stringify({
          error: 'Failed to create product',
          details: insertError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        product: newProduct,
        message: 'Product created successfully'
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in product-create function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
