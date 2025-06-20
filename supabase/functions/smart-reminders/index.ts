
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Running smart reminders check...');

    // Check for policy renewals (7 days before expiry)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: policiesNearExpiry, error: policiesError } = await supabaseClient
      .from('policies')
      .select('*')
      .eq('status', 'active')
      .lte('end_date', sevenDaysFromNow.toISOString().split('T')[0]);

    if (policiesError) {
      console.error('Error fetching policies:', policiesError);
    } else {
      console.log(`Found ${policiesNearExpiry?.length || 0} policies near expiry`);

      for (const policy of policiesNearExpiry || []) {
        const daysUntilExpiry = Math.ceil(
          (new Date(policy.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          // Check if notification already exists to avoid duplicates
          const { data: existingNotifications } = await supabaseClient
            .from('notifications')
            .select('id')
            .eq('user_id', policy.user_id)
            .ilike('message', `%${policy.policy_type} policy renews in ${daysUntilExpiry} day%`);

          if (!existingNotifications?.length) {
            await supabaseClient
              .from('notifications')
              .insert({
                user_id: policy.user_id,
                message: `Policy Renewal Reminder: Your ${policy.policy_type} policy renews in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
                status: 'unread'
              });

            console.log(`Created renewal reminder for policy ${policy.id}`);
          }
        }
      }
    }

    // Check for better deals
    const { data: allPolicies } = await supabaseClient
      .from('policies')
      .select('*')
      .eq('status', 'active');

    const { data: offers } = await supabaseClient
      .from('comparison_offers')
      .select('*');

    if (allPolicies && offers) {
      console.log(`Checking better deals for ${allPolicies.length} policies against ${offers.length} offers`);

      for (const policy of allPolicies) {
        const betterOffers = offers.filter(offer => 
          offer.policy_type === policy.policy_type &&
          Number(offer.premium_amount) < Number(policy.premium_amount)
        );

        if (betterOffers.length > 0) {
          const bestOffer = betterOffers.reduce((best, current) => 
            Number(current.premium_amount) < Number(best.premium_amount) ? current : best
          );

          const savings = Number(policy.premium_amount) - Number(bestOffer.premium_amount);

          // Check if notification already exists to avoid duplicates
          const { data: existingDeals } = await supabaseClient
            .from('notifications')
            .select('id')
            .eq('user_id', policy.user_id)
            .ilike('message', `%Better Deal Found%${bestOffer.insurer_name}%`);

          if (!existingDeals?.length) {
            await supabaseClient
              .from('notifications')
              .insert({
                user_id: policy.user_id,
                message: `Better Deal Found: Save £${savings.toFixed(2)}/month on your ${policy.policy_type} insurance with ${bestOffer.insurer_name}`,
                status: 'unread'
              });

            console.log(`Created better deal notification for policy ${policy.id}`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Smart reminders check completed',
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in smart-reminders function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
