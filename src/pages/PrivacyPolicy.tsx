const PrivacyPolicy = () => {
  return (
    <main className="flex-1 px-4 py-8 md:px-6 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-heading text-3xl font-bold text-foreground md:text-5xl">
          Privacy policy
        </h1>

        <p className="mb-8 text-base leading-relaxed text-muted-foreground md:text-lg">
          Replace this page with your product's privacy policy. The sections below outline a
          typical structure — adapt them to the data you actually collect.
        </p>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Information we collect
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Describe what user data you collect (e.g. email, profile data, payment metadata).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            How we use information
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Explain what you do with that data (operate the service, billing, support).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Third parties
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            List the third-party services you use (Supabase, Stripe, analytics, etc.).
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Contact
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Add your support email for privacy enquiries.
          </p>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
