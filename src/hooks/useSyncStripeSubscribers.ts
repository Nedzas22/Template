import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const THROTTLE_KEY = "stripe_subscribers_last_sync";
const THROTTLE_MS = 1000 * 60 * 60; // 1 hour

export const useSyncStripeSubscribers = () => {
  useEffect(() => {
    const lastSync = localStorage.getItem(THROTTLE_KEY);
    const now = Date.now();

    if (lastSync && now - Number(lastSync) < THROTTLE_MS) {
      return; // Already synced recently
    }

    localStorage.setItem(THROTTLE_KEY, String(now));

    supabase.functions
      .invoke("sync-stripe-subscribers")
      .then(({ error }) => {
        if (error) console.error("[SyncStripeSubscribers] Error:", error);
        else console.log("[SyncStripeSubscribers] Sync triggered successfully");
      });
  }, []);
};
