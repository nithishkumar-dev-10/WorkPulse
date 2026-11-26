import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import { Logo } from "@/components/layout/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signupSchema, type SignupFormValues } from "@/lib/authValidation";

export function SignupPage() {
  const { signup, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  if (status === "authenticated") return <Navigate to={from} replace />;

  const onSubmit = async (values: SignupFormValues) => {
    setFormError(null);
    try {
      await signup(values);
      toast.success("Account created — you're signed in");
      navigate(from, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create the account.";
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
          <Badge tone="accent">Get started</Badge>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            One account unlocks assessments, batch scoring and your local prediction history.
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
              <label htmlFor="signup-name" className="text-sm font-semibold">
                Full name
              </label>
              <Input
                id="signup-name"
                autoComplete="name"
                placeholder="Your name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "signup-name-error" : undefined}
                {...register("name")}
              />
              {errors.name && (
                <p
                  id="signup-name-error"
                  role="alert"
                  className="text-xs font-medium text-risk-high"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-email" className="text-sm font-semibold">
                Email
              </label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "signup-email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p
                  id="signup-email-error"
                  role="alert"
                  className="text-xs font-medium text-risk-high"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-password" className="text-sm font-semibold">
                Password
              </label>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "signup-password-error" : undefined}
                {...register("password")}
              />
              {errors.password ? (
                <p
                  id="signup-password-error"
                  role="alert"
                  className="text-xs font-medium text-risk-high"
                >
                  {errors.password.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Use 8+ characters with at least one letter and one number.
                </p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus className="h-4 w-4" aria-hidden="true" />
              )}
              {isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              state={location.state}
              className="font-semibold text-accent hover:underline"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
