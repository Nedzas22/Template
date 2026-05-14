import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Also check hash for type=recovery
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { password?: string; confirm?: string } = {};

    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      newErrors.password = result.error.errors[0].message;
    }
    if (password !== confirmPassword) {
      newErrors.confirm = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been reset successfully.",
      });
      navigate("/");
    }
    setLoading(false);
  };

  if (!isRecovery) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Logo />
        <p className="mt-6 text-muted-foreground">Verifying your reset link…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4">
      <header className="py-6">
        <Logo />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center pb-20 w-full max-w-md">
        <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="mb-2 text-center font-heading text-3xl font-bold text-foreground">
            Set new password
          </h1>
          <p className="mb-8 text-center text-muted-foreground">
            Enter your new password below
          </p>

          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                className={`rounded-xl ${errors.password ? "border-destructive" : ""}`}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirm) setErrors((p) => ({ ...p, confirm: undefined }));
                }}
                className={`rounded-xl ${errors.confirm ? "border-destructive" : ""}`}
              />
              {errors.confirm && (
                <p className="text-sm text-destructive">{errors.confirm}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Please wait..." : "Reset password"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
