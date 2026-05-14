/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;

  readonly VITE_PRODUCT_SLUG: string;
  readonly VITE_PRODUCT_NAME: string;
  readonly VITE_PRODUCT_DOMAIN: string;

  readonly VITE_POSTHOG_KEY: string;
  readonly VITE_POSTHOG_HOST: string;

  readonly VITE_GROWTHBOOK_CLIENT_KEY: string;
  readonly VITE_GROWTHBOOK_API_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
