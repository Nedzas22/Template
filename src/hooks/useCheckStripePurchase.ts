import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const THROTTLE_KEY = "check_stripe_purchase_last";
const THROTTLE_MS = 1000 * 60 * 30; // 30 minutes

/**
 * Runs check-stripe-purchase on page load for authenticated users.
 * Throttled to once per 30 minutes to avoid excessive Stripe API calls.
 */
export const useCheckStripePurchase = () => {
  useEffect(() => {
    const run = async () => {
      const lastRun = localStorage.getItem(THROTTLE_KEY);
      const now = Date.now();
      if (lastRun && now - Number(lastRun) < THROTTLE_MS) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      localStorage.setItem(THROTTLE_KEY, String(now));

      try {
        const { error } = await supabase.functions.invoke("check-stripe-purchase");
        if (error) console.error("[CheckStripePurchase] Error:", error);
        else console.log("[CheckStripePurchase] Check completed");
      } catch (err) {
        console.error("[CheckStripePurchase] Error:", err);
      }
    };

    run();
  }, []);
};
