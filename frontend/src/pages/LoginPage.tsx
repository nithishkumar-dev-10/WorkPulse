import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import { Logo } from "@/components/layout/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormValues } from "@/lib/authValidation";

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (status === "authenticated") return <Navigate to={from} replace />;

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await login(values);
      toast.success("Welcome back");
      navigate(from, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not sign in.";
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo />
        <span className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:block">
          Executive analytics
        </span>
      </header>

      <div className="mx-auto mt-10 max-w-md">
        <Card className="p-7 sm:p-9">
          <Badge tone="accent">Secure access</Badge>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sign in to run attrition assessments, score batches and review your history.
          </p>

          {formError && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-risk-high/20 bg-risk-high-soft px-3.5 py-3 text-sm font-medium text-risk-high"
            >
              {formError}
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-semibold">
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "login-email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p
                  id="login-email-error"
                  role="alert"
                  className="text-xs font-medium text-risk-high"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-semibold">
                Password
              </label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "login-password-error" : undefined}
                {...register("password")}
              />
              {errors.password && (
                <p
                  id="login-password-error"
                  role="alert"
                  className="text-xs font-medium text-risk-high"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogIn className="h-4 w-4" aria-hidden="true" />
              )}
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link
              to="/signup"
              state={location.state}
              className="font-semibold text-accent hover:underline"
            >
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
