import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { aiProductIngestBodySchema, validateJsonBody, createValidationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify webhook secret
    const providedSecret = req.headers.get('x-webhook-secret');
    if (webhookSecret && providedSecret !== webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook secret' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate request body
    const validationResult = await validateJsonBody(req, aiProductIngestBodySchema);
    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.errors!, corsHeaders);
    }

    const ingestData = validationResult.data;

    console.log('Ingesting product from:', ingestData.source_url);

    let extractedData = ingestData.product_data || {};

    // If we don't have product data, fetch and analyze the source URL
    if (!ingestData.product_data && openAIApiKey) {
      console.log('Fetching content from source URL...');

      try {
        const response = await fetch(ingestData.source_url);
        const content = await response.text();

        // Use AI to extract product information
        console.log('Analyzing content with AI...');

        const prompt = `
          You are an AI assistant specialized in extracting insurance product information from web pages and documents.
          Extract the following information and return it as a JSON object.
          If specific information is not available, return null for that field.

          Expected JSON format:
          {
            "company_name": "Name of the insurance company",
            "product_name": "Name of the insurance product",
            "policy_type": "health|auto|life|home|other",
            "description": "Brief product description",
            "premium_amount": "Monthly or annual premium (number only)",
            "currency": "Currency code (e.g., GBP, USD)",
            "billing_frequency": "monthly|quarterly|annually",
            "coverage_details": "What's covered",
            "coverage_limits": "Maximum coverage amounts",
            "deductible": "Deductible amount if mentioned",
            "benefits": "Key benefits (as array of strings)",
            "exclusions": "Key exclusions (as array of strings)",
            "minimum_age": "Minimum age requirement",
            "maximum_age": "Maximum age requirement",
            "available_countries": "Countries where available (as array)"
          }

          Content to analyze:
          ${content.substring(0, 8000)}
        `;

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert insurance product analyzer. Always return valid JSON responses only.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 2000,
          }),
        });

        if (aiResponse.ok) {
          const aiResult = await aiResponse.json();
          const analysisText = aiResult.choices[0].message.content;

          // Parse the JSON response
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            extractedData = JSON.parse(jsonMatch[0]);
            console.log('Successfully extracted product data with AI');
          }
        } else {
          console.warn('AI analysis failed, continuing with manual data');
        }
      } catch (error) {
        console.error('Error fetching/analyzing source:', error);
        // Continue with whatever data we have
      }
    }

    // Find or create insurance company
    let companyId: string | null = null;

    if (extractedData.company_name || ingestData.company_name) {
      const companyName = extractedData.company_name || ingestData.company_name;

      // Try to find existing company
      const { data: existingCompany } = await supabase
        .from('insurance_companies')
        .select('id')
        .eq('name', companyName)
        .single();

      if (existingCompany) {
        companyId = existingCompany.id;
        console.log('Found existing company:', companyName);
      } else {
        // Create new company (in auto-discovery mode)
        console.log('Creating new company:', companyName);

        const { data: newCompany, error: companyError } = await supabase
          .from('insurance_companies')
          .insert({
            name: companyName,
            is_active: true,
            // Generate a placeholder API key
            api_key: `auto_${Date.now()}_${Math.random().toString(36).substring(7)}`
          })
          .select('id')
          .single();

        if (!companyError && newCompany) {
          companyId = newCompany.id;
        }
      }
    }

    if (!companyId) {
      return new Response(
        JSON.stringify({
          error: 'Could not determine insurance company',
          extracted_data: extractedData
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Normalize policy type
    const policyTypes = ['health', 'auto', 'life', 'home', 'other'];
    let policyType = 'other';
    if (extractedData.policy_type) {
      const normalizedType = extractedData.policy_type.toLowerCase();
      if (policyTypes.includes(normalizedType)) {
        policyType = normalizedType;
      }
    }

    // Create or update product
    const productData = {
      company_id: companyId,
      product_name: extractedData.product_name || 'Unknown Product',
      product_code: extractedData.product_code,
      policy_type: policyType,
      description: extractedData.description,
      coverage_details: extractedData.coverage_details ?
        (typeof extractedData.coverage_details === 'string' ?
          { details: extractedData.coverage_details } :
          extractedData.coverage_details) : null,
      premium_amount: extractedData.premium_amount || 0,
      currency: extractedData.currency || 'GBP',
      billing_frequency: extractedData.billing_frequency || 'monthly',
      coverage_limits: extractedData.coverage_limits ?
        (typeof extractedData.coverage_limits === 'string' ?
          { limits: extractedData.coverage_limits } :
          extractedData.coverage_limits) : null,
      deductible: extractedData.deductible,
      benefits: extractedData.benefits ?
        (Array.isArray(extractedData.benefits) ?
          { items: extractedData.benefits } :
          extractedData.benefits) : null,
      exclusions: extractedData.exclusions ?
        (Array.isArray(extractedData.exclusions) ?
          { items: extractedData.exclusions } :
          extractedData.exclusions) : null,
      minimum_age: extractedData.minimum_age,
      maximum_age: extractedData.maximum_age,
      available_countries: extractedData.available_countries,
      search_keywords: extractedData.search_keywords,
      ai_tags: extractedData.ai_tags,
      is_active: true,
      last_crawled_at: new Date().toISOString()
    };

    // Try to find existing product by name and company
    const { data: existingProduct } = await supabase
      .from('insurance_products')
      .select('id')
      .eq('company_id', companyId)
      .eq('product_name', productData.product_name)
      .single();

    let result;
    if (existingProduct) {
      // Update existing product
      console.log('Updating existing product:', productData.product_name);
      const { data: updatedProduct, error: updateError } = await supabase
        .from('insurance_products')
        .update(productData)
        .eq('id', existingProduct.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }
      result = { action: 'updated', product: updatedProduct };
    } else {
      // Create new product
      console.log('Creating new product:', productData.product_name);
      const { data: newProduct, error: insertError } = await supabase
        .from('insurance_products')
        .insert(productData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }
      result = { action: 'created', product: newProduct };
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        source_url: ingestData.source_url,
        extracted_data: extractedData,
        message: `Product ${result.action} successfully`
      }),
      {
        status: result.action === 'created' ? 201 : 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in ai-product-ingest function:', error);
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
