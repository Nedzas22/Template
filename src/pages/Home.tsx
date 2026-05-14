import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const Home = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          SaaS Starter Template
        </h1>
        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
          A clean foundation for building SaaS products. Comes with authentication,
          billing, a polished UI kit, and a sensible project structure — bring your
          own product logic.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {user ? (
            <Link to="/profile">
              <Button size="lg" className="rounded-full px-6">
                Go to profile
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/auth">
                <Button size="lg" className="rounded-full px-6">
                  Get started
                </Button>
              </Link>
              <a
                href="https://github.com/Nedzas22/Template"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="rounded-full px-6">
                  View on GitHub
                </Button>
              </a>
            </>
          )}
        </div>

        <div className="mt-20 grid gap-6 text-left sm:grid-cols-3">
          <Feature
            title="Auth out of the box"
            body="Supabase email/password auth, password reset, and protected routes."
          />
          <Feature
            title="Billing scaffolding"
            body="Stripe webhook, customer portal, and subscription sync helpers."
          />
          <Feature
            title="Design system"
            body="Tailwind, shadcn/ui components, dark mode and Lucide icons."
          />
        </div>
      </div>
    </main>
  );
};

const Feature = ({ title, body }: { title: string; body: string }) => (
  <div className="rounded-2xl border border-border bg-card p-6">
    <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
    <p className="mt-2 text-sm text-muted-foreground">{body}</p>
  </div>
);

export default Home;
