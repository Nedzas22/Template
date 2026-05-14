import { product } from "@/config/product";

const TermsOfService = () => {
  return (
    <main className="flex-1 px-4 py-8 md:px-6 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-heading text-3xl font-bold text-foreground md:text-5xl">
          Terms of service
        </h1>

        <p className="mb-8 text-base leading-relaxed text-muted-foreground md:text-lg">
          These terms apply to your use of {product.name} ({product.domain}), operated by{" "}
          {product.legal.companyName}.
        </p>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Use of the service
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            You are responsible for activity on your account. You agree not to abuse the service,
            attempt to break our security, or use it for unlawful purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Billing
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Paid plans are billed monthly via Stripe and renew automatically until cancelled. You
            can cancel at any time from your profile and retain access until the end of the
            current billing period.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Disclaimers and liability
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            The service is provided "as is" without warranty. To the extent permitted by law,{" "}
            {product.legal.companyName} is not liable for indirect damages arising from your use
            of the service. These terms are governed by the laws of {product.legal.jurisdiction}.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Contact
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Questions about these terms? Email{" "}
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

export default TermsOfService;
