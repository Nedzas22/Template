import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. " +
      "Create a .env file based on .env.example."
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL ?? "http://localhost",
  SUPABASE_PUBLISHABLE_KEY ?? "public-anon-key",
  {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
