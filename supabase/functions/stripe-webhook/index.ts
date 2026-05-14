// Stripe webhook handler.
//
// Verifies the Stripe signature, then:
//   - On checkout.session.completed: upserts stripe_subscribers, forwards
//     order to alaunchkit studio (best-effort)
//   - On customer.subscription.{created,updated,deleted}: upserts
//     user_subscriptions
//   - On invoice.paid: placeholder for usage-counter resets
//
// Set these function secrets:
//   STRIPE_SECRET_KEY=sk_live_...
//   STRIPE_WEBHOOK_SECRET=whsec_...
//   STUDIO_WEBHOOK_URL=https://alaunchkit.vercel.app/api/webhook/order  (optional)
//   STUDIO_WEBHOOK_SECRET=...                                            (optional)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { forwardOrderToStudio } from "../_shared/studioWebhook.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (step: string, details?: Record<string, unknown>) => {
  const tail = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[stripe-webhook] ${step}${tail}`);
};

const PRODUCT_SLUG = Deno.env.get("PRODUCT_SLUG") ?? "";

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
        const email =
          (session.customer_email || session.customer_details?.email)?.toLowerCase() ?? null;
        const customerId = typeof session.customer === "string" ? session.customer : null;
        const userId = session.client_reference_id || session.metadata?.user_id || null;

        if (email && customerId) {
          const { error } = await supabaseAdmin
            .from("stripe_subscribers")
            .upsert(
              {
                user_id: userId,
                email,
                stripe_customer_id: customerId,
              },
              { onConflict: "stripe_customer_id" }
            );
          if (error) log("stripe_subscribers upsert error", { error: error.message });
        }

        // Forward the order to the studio dashboard for revenue tracking.
        if (session.amount_total && session.amount_total > 0) {
          await forwardOrderToStudio({
            external_order_id: session.id,
            amount: session.amount_total / 100,
            currency: (session.currency ?? "usd").toUpperCase(),
            product_slug: PRODUCT_SLUG,
            customer_email: email ?? undefined,
            utm_source: session.metadata?.utm_source,
            utm_medium: session.metadata?.utm_medium,
            utm_campaign: session.metadata?.utm_campaign,
            utm_content: session.metadata?.utm_content,
          });
        }

        log("checkout.session.completed processed", { sessionId: session.id, email });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const priceId = sub.items.data[0]?.price.id ?? null;

        // Resolve user_id from stripe_subscribers (populated on checkout)
        const { data: subscriber } = await supabaseAdmin
          .from("stripe_subscribers")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        const { error } = await supabaseAdmin
          .from("user_subscriptions")
          .upsert(
            {
              user_id: subscriber?.user_id ?? null,
              stripe_subscription_id: sub.id,
              stripe_customer_id: customerId,
              stripe_price_id: priceId,
              status: sub.status,
              tier: sub.items.data[0]?.price.lookup_key ?? null,
              current_period_end: sub.current_period_end
                ? new Date(sub.current_period_end * 1000).toISOString()
                : null,
              cancel_at_period_end: sub.cancel_at_period_end ?? false,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "stripe_subscription_id" }
          );
        if (error) log("user_subscriptions upsert error", { error: error.message });

        log(event.type, { subId: sub.id, status: sub.status });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        log("invoice.paid", { invoiceId: invoice.id, amount: invoice.amount_paid });
        // TODO: reset usage counters on a fresh billing cycle if your product
        // has per-period quotas (e.g. AI tokens).
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
