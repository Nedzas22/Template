// Template example: cancel the authenticated user's most-recent active Stripe
// subscription at period end. Expects a `user_subscriptions` table keyed by
// user_id with at least `stripe_subscription_id`, `status`, and
// `cancel_at_period_end` columns — adapt to your schema.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    const { data: claimsData } = await supabaseClient.auth.getClaims(token);
    const userId = claimsData?.claims?.sub as string | undefined;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: activeSub } = await supabaseAdmin
      .from("user_subscriptions")
      .select("stripe_subscription_id, status")
      .eq("user_id", userId)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!activeSub?.stripe_subscription_id) {
      return new Response(JSON.stringify({ message: "No active subscription" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const updated = await stripe.subscriptions.update(
      activeSub.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    await supabaseAdmin
      .from("user_subscriptions")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", activeSub.stripe_subscription_id);

    return new Response(
      JSON.stringify({
        success: true,
        cancel_at_period_end: true,
        current_period_end: updated.current_period_end
          ? new Date(updated.current_period_end * 1000).toISOString()
          : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
