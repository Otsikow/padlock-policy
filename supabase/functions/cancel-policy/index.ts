
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { cancelPolicyQuerySchema, validateQueryParams, createValidationErrorResponse } from "../_shared/validation.ts";

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
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
    const validationResult = validateQueryParams(url, cancelPolicyQuerySchema);
    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.errors!, corsHeaders);
    }

    const { policy_id: policyId, redirect_url } = validationResult.data;
    const redirectUrl = redirect_url || `${url.origin}/dashboard`;

    console.log(`Cancelling policy ${policyId} for user ${user.id}`);

    // Cancel the policy in the database
    const { error: updateError } = await supabaseClient
      .from('policies')
      .update({ status: 'cancelled' })
      .eq('id', policyId)
      .eq('user_id', user.id); // Ensure user can only cancel their own policies

    if (updateError) {
      console.error('Error cancelling policy:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to cancel policy' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a notification for the user
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: user.id,
        message: 'Your policy has been successfully cancelled.',
        status: 'unread'
      });

    console.log(`Policy ${policyId} cancelled successfully`);

    // Redirect back to the app with success status
    const finalRedirectUrl = `${redirectUrl}?status=cancelled&policy_id=${policyId}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': finalRedirectUrl,
      },
    });

  } catch (error) {
    console.error('Error in cancel-policy function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
