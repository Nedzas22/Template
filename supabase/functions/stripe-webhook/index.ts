// Stripe webhook handler — template example.
//
// Verifies the Stripe signature, then dispatches to handlers for a handful of
// common events. Replace the body of each handler with whatever your product
// needs to do (provision access, write to your DB, etc.).

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (step: string, details?: Record<string, unknown>) => {
  const tail = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[stripe-webhook] ${step}${tail}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "No signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      log("signature verification failed", { error: String(err) });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log("event", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        log("checkout.session.completed", {
          sessionId: session.id,
          email: session.customer_email,
          paymentStatus: session.payment_status,
        });
        // TODO: grant access for the purchased product to the user.
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        log(event.type, { subId: sub.id, status: sub.status });
        // TODO: persist subscription state in your DB.
        // Example: upsert into a `subscriptions` table keyed by stripe_subscription_id.
        void supabaseAdmin; // referenced so the import isn't tree-shaken in the example
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        log("invoice.paid", { invoiceId: invoice.id, amount: invoice.amount_paid });
        // TODO: reset usage counters on a fresh billing cycle.
        break;
      }

      default:
        log("unhandled event", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    log("ERROR", { message: String(error) });
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
