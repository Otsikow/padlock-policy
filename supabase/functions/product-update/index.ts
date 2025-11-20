import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface ProductUpdateRequest {
  product_id: string;
  product_name?: string;
  product_code?: string;
  policy_type?: 'health' | 'auto' | 'life' | 'home' | 'other';
  description?: string;
  coverage_details?: Record<string, any>;
  premium_amount?: number;
  currency?: string;
  billing_frequency?: string;
  coverage_limits?: Record<string, any>;
  deductible?: number;
  benefits?: Record<string, any>;
  exclusions?: Record<string, any>;
  is_active?: boolean;
  available_countries?: string[];
  minimum_age?: number;
  maximum_age?: number;
  product_image_url?: string;
  brochure_url?: string;
  terms_url?: string;
  search_keywords?: string[];
  ai_tags?: string[];
  popularity_score?: number;
}

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
      endpoint_val: 'product-update',
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

    // Parse request body
    const updateData: ProductUpdateRequest = await req.json();

    if (!updateData.product_id) {
      return new Response(
        JSON.stringify({ error: 'product_id is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify product belongs to company
    const { data: existingProduct, error: fetchError } = await supabase
      .from('insurance_products')
      .select('id, company_id')
      .eq('id', updateData.product_id)
      .single();

    if (fetchError || !existingProduct) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (existingProduct.company_id !== company.id) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to update this product' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate policy_type if provided
    if (updateData.policy_type) {
      const validPolicyTypes = ['health', 'auto', 'life', 'home', 'other'];
      if (!validPolicyTypes.includes(updateData.policy_type)) {
        return new Response(
          JSON.stringify({
            error: `Invalid policy_type. Must be one of: ${validPolicyTypes.join(', ')}`
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Build update object (exclude product_id from update)
    const { product_id, ...fieldsToUpdate } = updateData;

    // Update product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('insurance_products')
      .update(fieldsToUpdate)
      .eq('id', product_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating product:', updateError);
      return new Response(
        JSON.stringify({
          error: 'Failed to update product',
          details: updateError.message
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
        product: updatedProduct,
        message: 'Product updated successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in product-update function:', error);
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
