// Single source of truth for product-specific copy and identity.
//
// After cloning the template, edit this file (or let spawn-product populate
// it) and the marketing pages, legal pages, header, footer, and analytics
// will all pick up the new values.
//
// Anything secret (AI prompts, API keys) lives in Supabase function secrets,
// NOT here — this file ships to the browser bundle.

import type { Feature, FaqItem, PricingTier } from "./product.types";

export const product = {
  slug: import.meta.env.VITE_PRODUCT_SLUG ?? "template",
  name: import.meta.env.VITE_PRODUCT_NAME ?? "Template",
  domain: import.meta.env.VITE_PRODUCT_DOMAIN ?? "example.com",

  tagline: "A clean foundation for building SaaS products.",
  description:
    "Authentication, billing, a polished UI kit, and a sensible project structure — bring your own product logic.",

  hero: {
    title: "Template",
    subtitle:
      "A clean foundation for building SaaS products. Comes with authentication, billing, a polished UI kit, and a sensible project structure — bring your own product logic.",
    primaryCta: { label: "Get started", href: "/auth" },
    secondaryCta: { label: "View on GitHub", href: "https://github.com/Nedzas22/Template" },
  },

  features: [
    {
      title: "Auth out of the box",
      body: "Supabase email/password auth, password reset, and protected routes.",
    },
    {
      title: "Billing scaffolding",
      body: "Stripe webhook, customer portal, and subscription sync helpers.",
    },
    {
      title: "Design system",
      body: "Tailwind, shadcn/ui components, dark mode and Lucide icons.",
    },
  ] satisfies Feature[],

  pricing: [
    {
      id: "starter",
      name: "Starter",
      monthlyPrice: 19,
      currency: "USD",
      stripePriceId: "",
      features: ["Core features", "Email support"],
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: 49,
      currency: "USD",
      stripePriceId: "",
      features: ["Everything in Starter", "Priority support", "Advanced features"],
      highlighted: true,
    },
  ] satisfies PricingTier[],

  faq: [] satisfies FaqItem[],

  legal: {
    companyName: "Your Company, UAB",
    jurisdiction: "Lithuania",
    supportEmail: "support@example.com",
    address: "",
  },

  ai: {
    model: "claude-sonnet-4-6",
  },
} as const;

export type Product = typeof product;
