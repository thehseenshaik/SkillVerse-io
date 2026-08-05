/**
 * Enhanced Login Form
 * Login form with remember me, forgot password, and multiple auth methods
 */

import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Wand2,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import {
  signIn,
  signInWithGoogle,
  signInWithGithub,
  sendMagicLink,
} from "@/services/auth.service";
import { loginSchema, magicLinkSchema } from "@/lib/validation/auth";
import type { LoginFormData } from "@/lib/validation/auth";
import { toast } from "sonner";

type Mode = "login" | "magic";

export function EnhancedLoginForm() {
  const navigate = useNavigate();
  
  // Get redirect parameter from URL search params
  const getRedirectParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect');
  };
  
  const [mode, setMode] = useState<Mode>("login");
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  } as LoginFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<
    null | "email" | "google" | "github" | "magic"
  >(null);
  const [magicSent, setMagicSent] = useState(false);

  const handleInputChange = (
    field: keyof LoginFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const schema = mode === "login" ? loginSchema : magicLinkSchema;
    const result = schema.safeParse(formData);
    if (!result.success) {
      const formErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        formErrors[path] = issue.message;
      });
      setErrors(formErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (mode === "magic") {
      await handleMagicLink();
      return;
    }

    setIsSubmitting("email");
    try {
      await signIn(formData);
      toast.success("Signed in successfully!");
      
      // Redirect to intended destination or dashboard
      const redirect = getRedirectParam();
      if (redirect && redirect !== "/") {
        navigate({ to: redirect, replace: true });
      } else {
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleMagicLink = async () => {
    setIsSubmitting("magic");
    try {
      await sendMagicLink(formData.email);
      setMagicSent(true);
      toast.success(
        "Magic link sent to your email! Click the link in your email to sign in.",
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to send magic link");
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting("google");
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google successfully!");
      
      // Redirect to intended destination or dashboard
      const redirect = getRedirectParam();
      if (redirect && redirect !== "/") {
        navigate({ to: redirect, replace: true });
      } else {
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleGithubSignIn = async () => {
    setIsSubmitting("github");
    try {
      await signInWithGithub();
      toast.success("Signed in with GitHub successfully!");
      
      // Redirect to intended destination or dashboard
      const redirect = getRedirectParam();
      if (redirect && redirect !== "/") {
        navigate({ to: redirect, replace: true });
      } else {
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with GitHub");
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="glass rounded-3xl p-8 shadow-elegant">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in to your Career Command Center.
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="grid gap-2.5 mb-6">
          <button
            type="button"
            disabled={!!isSubmitting}
            onClick={handleGoogleSignIn}
            className="group inline-flex h-11 items-center justify-center gap-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground shadow-sm transition-all hover:border-foreground/40 hover:bg-secondary/60 disabled:opacity-60"
          >
            {isSubmitting === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FcGoogle className="h-[18px] w-[18px]" />
            )}
            Continue with Google
          </button>
          <button
            type="button"
            disabled={!!isSubmitting}
            onClick={handleGithubSignIn}
            className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg border border-[#24292f]/60 bg-[#24292f] text-sm font-medium text-white shadow-sm transition-all hover:bg-[#1b1f24] disabled:opacity-60 dark:border-white/15"
          >
            {isSubmitting === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FaGithub className="h-[18px] w-[18px]" />
            )}
            Continue with GitHub
          </button>
        </div>

        {/* Magic Link */}
        <div className="mb-6">
          {magicSent ? (
            <div className="flex items-start gap-2 rounded-lg border border-brand/40 bg-brand/5 p-3 text-xs">
              <Mail className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand" />
              <span>
                Magic link sent to <b>{formData.email}</b>. Open your inbox and
                tap the link to sign in.
                <button
                  type="button"
                  onClick={() => {
                    setMagicSent(false);
                    setMode("login");
                  }}
                  className="ml-1 underline"
                >
                  Use a different email
                </button>
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("magic");
                setErrors({});
              }}
              disabled={!!isSubmitting}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-dashed border-brand/50 bg-brand/5 text-xs font-semibold text-brand transition-colors hover:bg-brand/10 disabled:opacity-60"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Email me a magic link (passwordless)
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <FormField
            label="Email"
            icon={<Mail className="h-4 w-4" />}
            type="email"
            id="email"
            value={formData.email}
            onChange={(v) => handleInputChange("email", v)}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          {/* Password - Only show in login mode */}
          {mode === "login" && (
            <FormField
              label="Password"
              icon={<Lock className="h-4 w-4" />}
              type={showPassword ? "text" : "password"}
              id="password"
              value={formData.password}
              onChange={(v) => handleInputChange("password", v)}
              error={errors.password}
              placeholder="Your password"
              autoComplete="current-password"
              required
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />
          )}

          {/* Remember Me & Forgot Password - Only in login mode */}
          {mode === "login" && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    handleInputChange("rememberMe", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-border bg-background text-brand focus:ring-brand focus:ring-offset-0"
                />
                <span className="text-xs text-muted-foreground">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {/* Form Error */}
          {errors.form && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-2.5 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting === "email" || isSubmitting === "magic"}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-gradient text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {isSubmitting === "email" || isSubmitting === "magic" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />{" "}
                {mode === "magic" ? "Sending..." : "Logging in..."}
              </>
            ) : mode === "magic" ? (
              "Send Magic Link"
            ) : (
              "Log in"
            )}
          </button>

          {/* Security Notice */}
          <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-secondary/40 p-3 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand" />
            <span>
              Secured with Firebase Authentication. Your credentials never touch
              our servers.
            </span>
          </div>
        </form>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to SkillVerse?{" "}
          <Link
            to="/signup"
            className="font-semibold text-foreground hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  icon: React.ReactNode;
  type: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  suffix?: React.ReactNode;
}

function FormField({
  label,
  icon,
  type,
  id,
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  required,
  suffix,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-foreground"
      >
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div
        className={`flex h-11 items-center gap-2 rounded-md border bg-background px-3 transition-colors focus-within:border-foreground ${
          error ? "border-destructive" : "border-border"
        }`}
      >
        <span className="text-muted-foreground">{icon}</span>
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
        />
        {suffix && <span className="text-muted-foreground">{suffix}</span>}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive"
        >
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}
