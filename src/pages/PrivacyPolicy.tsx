import { product } from "@/config/product";

const PrivacyPolicy = () => {
  return (
    <main className="flex-1 px-4 py-8 md:px-6 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-heading text-3xl font-bold text-foreground md:text-5xl">
          Privacy policy
        </h1>

        <p className="mb-8 text-base leading-relaxed text-muted-foreground md:text-lg">
          This page describes how {product.name} ({product.domain}) collects and uses your data.
        </p>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Information we collect
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            We collect your email address and any profile data you provide. If you subscribe to a
            paid plan, our payment processor (Stripe) handles your payment details — we never see
            your card information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            How we use information
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            We use your data to operate the service, process billing, and provide support. We do
            not sell or share your personal data with third parties for advertising.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Third parties
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            We rely on the following services: Supabase (database and authentication), Stripe
            (billing), and analytics providers for product usage statistics.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Contact
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            For privacy enquiries, email{" "}
            <a className="underline" href={`mailto:${product.legal.supportEmail}`}>
              {product.legal.supportEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
