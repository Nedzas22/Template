// Template example: check whether the authenticated user has any successful
// Stripe purchases, and return their product IDs.
//
// Replace this with whatever logic your product needs (provisioning, syncing
// subscription state, etc.). Kept here as a starting point for paid SaaS.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?dts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userEmail = claimsData.claims.email as string;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: userEmail, limit: 5 });
    const productIds = new Set<string>();
    let hasPurchase = false;

    for (const customer of customers.data) {
      const sessions = await stripe.checkout.sessions.list({
        customer: customer.id,
        limit: 50,
        expand: ["data.line_items"],
      });

      for (const session of sessions.data) {
        if (session.payment_status !== "paid") continue;
        hasPurchase = true;
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
        for (const item of lineItems.data) {
          const product = item.price?.product;
          if (typeof product === "string") productIds.add(product);
        }
      }
    }

    return new Response(
      JSON.stringify({
        has_purchase: hasPurchase,
        product_ids: Array.from(productIds),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
