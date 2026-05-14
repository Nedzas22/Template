import posthog from "posthog-js";
import { product } from "@/config/product";

const key = import.meta.env.VITE_POSTHOG_KEY;
const host = import.meta.env.VITE_POSTHOG_HOST ?? "https://eu.posthog.com";

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  if (!key) {
    console.warn(
      "[posthog] VITE_POSTHOG_KEY is missing — analytics events will not be tracked."
    );
    return;
  }

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    persistence: "localStorage",
    loaded: (ph) => {
      ph.register({ product: product.slug });
    },
  });

  initialized = true;
}

export function identifyUser(userId: string, traits: Record<string, unknown> = {}) {
  if (!initialized) return;
  posthog.identify(userId, { product: product.slug, ...traits });
}

export function resetUser() {
  if (!initialized) return;
  posthog.reset();
}

export { posthog };
