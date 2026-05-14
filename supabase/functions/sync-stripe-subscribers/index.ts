// Template example: walk all completed Stripe checkout sessions and upsert a
// row per paid customer into a `stripe_subscribers` table.
//
// Customize the table name and which products you care about for your product.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const emailMap = new Map<string, string | null>();

    let hasMore = true;
    let startingAfter: string | undefined;
    while (hasMore) {
      const params: Stripe.Checkout.SessionListParams = {
        limit: 100,
        status: "complete",
      };
      if (startingAfter) params.starting_after = startingAfter;

      const sessions = await stripe.checkout.sessions.list(params);
      for (const session of sessions.data) {
        const email = (session.customer_email || session.customer_details?.email)?.toLowerCase();
        if (!email || emailMap.has(email)) continue;
        const custId = typeof session.customer === "string" ? session.customer : null;
        emailMap.set(email, custId);
      }

      hasMore = sessions.has_more;
      if (sessions.data.length > 0) {
        startingAfter = sessions.data[sessions.data.length - 1].id;
      }
    }

    const rows = Array.from(emailMap.entries()).map(([email, customerId]) => ({
      email,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    }));

    for (let i = 0; i < rows.length; i += 50) {
      const chunk = rows.slice(i, i + 50);
      const { error } = await supabaseAdmin
        .from("stripe_subscribers")
        .upsert(chunk, { onConflict: "email" });
      if (error) throw new Error(error.message || JSON.stringify(error));
    }

    return new Response(
      JSON.stringify({ success: true, count: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
