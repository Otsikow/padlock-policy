import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { companyOnboardBodySchema, validateJsonBody, createValidationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a secure API key
function generateApiKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return 'pk_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
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

    // This endpoint should be protected - only admins can onboard companies
    // Get the authorization header
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Only administrators can onboard insurance companies' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate request body
    const validationResult = await validateJsonBody(req, companyOnboardBodySchema);
    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.errors!, corsHeaders);
    }

    const companyData = validationResult.data;

    // Check if company name already exists
    const { data: existingCompany } = await supabase
      .from('insurance_companies')
      .select('id')
      .eq('name', companyData.name)
      .single();

    if (existingCompany) {
      return new Response(
        JSON.stringify({ error: 'A company with this name already exists' }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate API key for the company
    const apiKey = generateApiKey();

    // Create company
    const { data: newCompany, error: insertError } = await supabase
      .from('insurance_companies')
      .insert({
        name: companyData.name,
        description: companyData.description,
        logo_url: companyData.logo_url,
        website: companyData.website,
        contact_email: companyData.contact_email,
        contact_phone: companyData.contact_phone,
        address: companyData.address,
        country: companyData.country,
        business_registration_number: companyData.business_registration_number,
        license_number: companyData.license_number,
        regulatory_body: companyData.regulatory_body,
        api_key: apiKey,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating company:', insertError);
      return new Response(
        JSON.stringify({
          error: 'Failed to create company',
          details: insertError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Send welcome email (you would integrate with your email service here)
    console.log(`Company onboarded: ${newCompany.name}`);
    console.log(`API Key: ${apiKey}`);

    return new Response(
      JSON.stringify({
        success: true,
        company: {
          ...newCompany,
          api_key: apiKey // Return API key only on creation
        },
        message: 'Insurance company onboarded successfully',
        instructions: 'Please save the API key securely. It will not be shown again. Use this key in the x-api-key header for all API requests.'
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in company-onboard function:', error);
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
