# SaaS Starter Template

A clean foundation for building SaaS products. The AI / image-generation
product logic has been stripped out — what's left is the scaffolding you tend
to need every time: auth, billing, layout, and a polished UI kit.

## What's inside

- **React + Vite + TypeScript** with path aliases (`@/`)
- **Tailwind CSS** and the full **shadcn/ui** component library
- **Supabase** auth (email/password + reset flow) and a typed client
- **Stripe** edge function scaffolding: webhook, customer portal,
  cancel-subscription, sync-stripe-subscribers, check-stripe-purchase
- **React Router** with a layout for shared header/footer pages
- **TanStack Query** preconfigured
- **Vitest** test runner

## Getting started

```sh
# 1. Install dependencies
npm install

# 2. Configure your Supabase project
cp .env.example .env
# then edit .env with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Run the dev server
npm run dev
```

The app runs on http://localhost:8080.

## Project layout

```
src/
  components/
    ui/              shadcn/ui primitives (kept in full)
    Header.tsx       Top navigation
    Footer.tsx       Footer with policy links
    Layout.tsx       Shared header/footer outlet
    Logo.tsx         Wordmark — replace with your own
  pages/
    Home.tsx         Landing page
    Auth.tsx         Login / signup / forgot password
    ResetPassword.tsx
    Profile.tsx      Profile + password change
    PrivacyPolicy.tsx
    TermsOfService.tsx
    RefundPolicy.tsx
    NotFound.tsx
  hooks/
    use-toast.ts
    use-mobile.tsx
    useAuthRedirect.ts          Redirect authed users away from /auth
    useCheckStripePurchase.ts   Periodic Stripe purchase check
    useSyncStripeSubscribers.ts Sync Stripe subscribers to your DB
    useDebouncedValue.ts
  integrations/
    supabase/
      client.ts      Reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
      types.ts       Stub Database type — regenerate from your schema
  lib/
    utils.ts         `cn()` helper

supabase/
  config.toml        Edge function JWT settings
  functions/
    stripe-webhook/           Handles checkout / subscription events
    check-stripe-purchase/    Checks if user has paid
    customer-portal/          Opens Stripe billing portal
    cancel-subscription/      Cancels at period end
    sync-stripe-subscribers/  Syncs Stripe customers into Supabase
```

## Setting up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy your project URL and anon key into `.env`.
3. Link the local project and push migrations:
   ```sh
   supabase link --project-ref <your-ref>
   supabase db push
   ```
   This creates `profiles`, `stripe_subscribers`, `user_subscriptions`, and
   `ai_token_usage` tables with RLS policies and an auto-profile trigger on
   signup. See `supabase/migrations/`.
4. Regenerate types: `supabase gen types typescript --project-id <ref> > src/integrations/supabase/types.ts`.

## Setting up Stripe

Each product runs against its own standalone Stripe account (venture studio
model — no Connect platform needed).

1. Create products + prices in the Stripe dashboard.
2. Set function secrets:
   ```sh
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. Deploy the functions: `supabase functions deploy stripe-webhook` etc.
4. Point Stripe webhook at `https://<project>.supabase.co/functions/v1/stripe-webhook`.

The included edge functions are starting points — open each `index.ts` and
replace the TODOs with logic for your product.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run test` — run Vitest once
- `npm run test:watch` — Vitest in watch mode

## License

MIT.
