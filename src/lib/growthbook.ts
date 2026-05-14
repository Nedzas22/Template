import { GrowthBook } from "@growthbook/growthbook-react";
import { product } from "@/config/product";

const apiHost = import.meta.env.VITE_GROWTHBOOK_API_HOST ?? "https://cdn.growthbook.io";
const clientKey = import.meta.env.VITE_GROWTHBOOK_CLIENT_KEY;

export const growthbook = new GrowthBook({
  apiHost,
  clientKey,
  enableDevMode: import.meta.env.DEV,
  subscribeToChanges: true,
  trackingCallback: (experiment, result) => {
    // Forwarded to PostHog automatically if posthog-js is loaded.
    if (typeof window !== "undefined" && (window as unknown as { posthog?: { capture: (e: string, p: Record<string, unknown>) => void } }).posthog) {
      (window as unknown as { posthog: { capture: (e: string, p: Record<string, unknown>) => void } }).posthog.capture("$experiment_started", {
        product: product.slug,
        experimentId: experiment.key,
        variationId: result.key,
      });
    }
  },
});

export async function initGrowthBook() {
  if (!clientKey) {
    console.warn(
      "[growthbook] VITE_GROWTHBOOK_CLIENT_KEY is missing — feature flags will use defaults."
    );
    return;
  }
  growthbook.setAttributes({ product: product.slug });
  await growthbook.init({ streaming: true });
}

export function identifyGrowthBookUser(userId: string, traits: Record<string, unknown> = {}) {
  growthbook.setAttributes({
    ...growthbook.getAttributes(),
    id: userId,
    product: product.slug,
    ...traits,
  });
}
