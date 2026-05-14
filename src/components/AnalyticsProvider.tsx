import { useEffect, useState, type ReactNode } from "react";
import { GrowthBookProvider } from "@growthbook/growthbook-react";
import { supabase } from "@/integrations/supabase/client";
import { initPostHog, identifyUser, resetUser } from "@/lib/posthog";
import { growthbook, initGrowthBook, identifyGrowthBookUser } from "@/lib/growthbook";

interface AnalyticsProviderProps {
  children: ReactNode;
}

const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const [gbReady, setGbReady] = useState(false);

  useEffect(() => {
    initPostHog();
    initGrowthBook().finally(() => setGbReady(true));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const traits = { email: session.user.email };
        identifyUser(session.user.id, traits);
        identifyGrowthBookUser(session.user.id, traits);
      } else if (event === "SIGNED_OUT") {
        resetUser();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const traits = { email: session.user.email };
        identifyUser(session.user.id, traits);
        identifyGrowthBookUser(session.user.id, traits);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!gbReady) {
    return <>{children}</>;
  }

  return <GrowthBookProvider growthbook={growthbook}>{children}</GrowthBookProvider>;
};

export default AnalyticsProvider;
