import { product } from "@/config/product";

const RefundPolicy = () => {
  return (
    <main className="flex-1 px-4 py-8 md:px-6 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-heading text-3xl font-bold text-foreground md:text-5xl">
          Refund policy
        </h1>

        <p className="mb-8 text-base leading-relaxed text-muted-foreground md:text-lg">
          This page describes the refund policy for {product.name} ({product.domain}).
        </p>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Eligibility
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            New paid subscriptions are eligible for a refund if you have not made substantial use
            of the service. Refunds are issued at our discretion.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Refund window
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Refund requests must be submitted within 14 days of the original charge.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Contact
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            To request a refund, email{" "}
            <a className="underline" href={`mailto:${product.legal.supportEmail}`}>
              {product.legal.supportEmail}
            </a>{" "}
            with your account email and the charge date.
          </p>
        </section>
      </div>
    </main>
  );
};

export default RefundPolicy;
