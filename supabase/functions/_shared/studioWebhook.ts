// Forwards an order event to the alaunchkit studio dashboard.
//
// Used by stripe-webhook on checkout.session.completed. Failure here MUST NOT
// fail the calling function — studio reporting is best-effort.

export interface StudioOrderPayload {
  external_order_id?: string;
  amount: number;
  currency?: string;
  product_slug?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  customer_email?: string;
}

export async function forwardOrderToStudio(payload: StudioOrderPayload) {
  const url = Deno.env.get("STUDIO_WEBHOOK_URL");
  if (!url) return;

  const secret = Deno.env.get("STUDIO_WEBHOOK_SECRET");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (secret) headers["x-webhook-secret"] = secret;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn(
        `[studio-webhook] forward failed ${res.status}: ${await res.text()}`
      );
    }
  } catch (err) {
    console.warn("[studio-webhook] forward threw", err);
  }
}
