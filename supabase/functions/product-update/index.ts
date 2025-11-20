import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { productUpdateBodySchema, validateJsonBody, createValidationErrorResponse } from "../_shared/validation.ts";

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

    // Validate request body
    const validationResult = await validateJsonBody(req, productUpdateBodySchema);
    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.errors!, corsHeaders);
    }

    const updateData = validationResult.data;

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
