import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { product } from "@/config/product";
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
          {product.hero.title}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
          {product.hero.subtitle}
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
              <Link to={product.hero.primaryCta.href}>
                <Button size="lg" className="rounded-full px-6">
                  {product.hero.primaryCta.label}
                </Button>
              </Link>
              <a
                href={product.hero.secondaryCta.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="rounded-full px-6">
                  {product.hero.secondaryCta.label}
                </Button>
              </a>
            </>
          )}
        </div>

        <div className="mt-20 grid gap-6 text-left sm:grid-cols-3">
          {product.features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Home;
