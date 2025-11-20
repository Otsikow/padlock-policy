
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { switchPolicyQuerySchema, validateQueryParams, createValidationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate query parameters
    const url = new URL(req.url);
    const validationResult = validateQueryParams(url, switchPolicyQuerySchema);
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.errors);
      return createValidationErrorResponse(validationResult.errors!, corsHeaders);
    }

    const { from_policy_id: fromPolicyId, redirect_url } = validationResult.data;
    const redirectUrl = redirect_url || `${url.origin}/compare`;

    console.log(`Initiating policy switch for user ${user.id} from policy ${fromPolicyId}`);

    // Verify the user owns the policy they want to switch from
    const { data: policy, error: policyError } = await supabaseClient
      .from('policies')
      .select('*')
      .eq('id', fromPolicyId)
      .eq('user_id', user.id)
      .single();

    if (policyError || !policy) {
      console.error('Policy error:', policyError);
      return new Response(
        JSON.stringify({ error: 'Policy not found or unauthorized' }), 
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a notification for the user
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: user.id,
        message: 'We are finding better policy options for you. You will be redirected to compare policies.',
        status: 'unread'
      });

    console.log(`Policy switch initiated for policy ${fromPolicyId}`);

    // Redirect to compare page with the current policy info
    const finalRedirectUrl = `${redirectUrl}?status=switching&from_policy_id=${fromPolicyId}&policy_type=${policy.policy_type}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': finalRedirectUrl,
      },
    });

  } catch (error) {
    console.error('Error in switch-policy function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
