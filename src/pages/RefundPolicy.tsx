const RefundPolicy = () => {
  return (
    <main className="flex-1 px-4 py-8 md:px-6 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-heading text-3xl font-bold text-foreground md:text-5xl">
          Refund policy
        </h1>

        <p className="mb-8 text-base leading-relaxed text-muted-foreground md:text-lg">
          Replace this page with your product's refund policy. The structure below is a starting
          point — customize the eligibility, timing, and contact details to match your business.
        </p>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Eligibility
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Describe who qualifies for a refund and under what conditions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Refund window
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            State your refund window (for example, 14 days from purchase).
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
            Contact
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Add your support email so users can request a refund.
          </p>
        </section>
      </div>
    </main>
  );
};

export default RefundPolicy;
