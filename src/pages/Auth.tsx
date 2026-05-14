import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
          navigate("/");
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({
            title: "Login failed",
            description: error.message.includes("Invalid login credentials")
              ? "Invalid email or password."
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({ title: "Welcome back!" });
        }
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { display_name: displayName },
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Account exists",
              description: "Try logging in instead.",
              variant: "destructive",
            });
            setIsLogin(true);
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account created",
            description: "Check your email to confirm your account.",
          });
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4">
      <header className="py-6">
        <Logo />
      </header>

      <main className="flex w-full max-w-md flex-1 flex-col items-center justify-center pb-20">
        <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="mb-2 text-center font-heading text-3xl font-bold text-foreground">
            {forgotMode ? "Reset password" : isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mb-8 text-center text-muted-foreground">
            {forgotMode
              ? "Enter your email and we'll send a reset link"
              : isLogin
                ? "Sign in to your account"
                : "Get started in seconds"}
          </p>

          {forgotMode ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const emailResult = emailSchema.safeParse(email);
                if (!emailResult.success) {
                  setErrors({ email: emailResult.error.errors[0].message });
                  return;
                }
                setForgotLoading(true);
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) {
                  toast({ title: "Error", description: error.message, variant: "destructive" });
                } else {
                  toast({ title: "Email sent", description: "Check your inbox." });
                  setForgotMode(false);
                }
                setForgotLoading(false);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`rounded-xl ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={forgotLoading}>
                {forgotLoading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`rounded-xl ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`rounded-xl ${errors.password ? "border-destructive" : ""}`}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Please wait…" : isLogin ? "Log in" : "Create account"}
              </Button>
            </form>
          )}

          <div className="mt-6 space-y-2 text-center">
            {isLogin && !forgotMode && (
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="text-sm text-muted-foreground underline hover:text-foreground"
              >
                Forgot your password?
              </button>
            )}
            {forgotMode && (
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                className="text-sm text-muted-foreground underline hover:text-foreground"
              >
                ← Back to login
              </button>
            )}
            <p className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setForgotMode(false);
                }}
                className="font-medium text-foreground underline hover:no-underline"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
