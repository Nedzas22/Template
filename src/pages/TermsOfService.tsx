const TermsOfService = () => {
  return (
    <main className="flex-1 px-4 py-8 md:px-6 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-heading text-3xl font-bold text-foreground md:text-5xl">
          Terms of service
        </h1>

        <p className="mb-8 text-base leading-relaxed text-muted-foreground md:text-lg">
          Replace this page with your product's terms of service. The sections below outline a
          typical structure — adapt them to your business model.
        </p>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Use of the service
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Describe acceptable use, account responsibilities, and prohibited activities.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Billing
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Explain pricing, billing cycles, and how to cancel.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Disclaimers and liability
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Add legal disclaimers, limitation of liability, and warranty information.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Contact
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Add your contact details for legal enquiries.
          </p>
        </section>
      </div>
    </main>
  );
};

export default TermsOfService;
