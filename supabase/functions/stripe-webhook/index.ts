
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
    );

    logStep("Event verified", { type: event.type });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        
        if (!userId) {
          logStep("No user_id in session metadata");
          break;
        }

        if (session.metadata?.type === 'subscription') {
          // Handle subscription
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await supabaseClient.from("subscriptions").insert({
            user_id: userId,
            plan_id: session.metadata.plan_id,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            currency: session.currency?.toUpperCase() || 'GBP',
            amount: (session.amount_total || 0) / 100,
            start_date: new Date(subscription.current_period_start * 1000).toISOString(),
            end_date: new Date(subscription.current_period_end * 1000).toISOString()
          });

          logStep("Subscription created", { subscriptionId: subscription.id });
        } else {
          // Handle one-time payment
          await supabaseClient
            .from("payments")
            .update({
              status: 'completed',
              transaction_reference: session.payment_intent as string
            })
            .eq('stripe_session_id', session.id);

          logStep("Payment completed", { sessionId: session.id });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabaseClient
          .from("subscriptions")
          .update({
            status: subscription.status,
            end_date: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        logStep("Subscription updated", { subscriptionId: subscription.id, status: subscription.status });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabaseClient
          .from("subscriptions")
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id);

        logStep("Subscription cancelled", { subscriptionId: subscription.id });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
