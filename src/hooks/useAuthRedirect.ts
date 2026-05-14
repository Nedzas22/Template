import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Pages that should only be visible while signed-out (e.g. /auth).
 * Authenticated visitors are redirected to `redirectTo`.
 */
const PUBLIC_ONLY_ROUTES = ["/auth"];

export const useAuthRedirect = (redirectTo: string = "/") => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user && PUBLIC_ONLY_ROUTES.includes(location.pathname)) {
          navigate(redirectTo, { replace: true });
        }
        setChecked(true);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname, redirectTo]);

  return checked;
};
