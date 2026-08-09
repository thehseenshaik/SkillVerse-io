import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { FaGoogle, FaGithub, FaApple } from "react-icons/fa";
import {
  signIn,
  signInWithGoogle,
  signInWithGithub,
} from "@/services/auth.service";
import { loginSchema } from "@/lib/validation/auth";
import type { LoginFormData } from "@/lib/validation/auth";
import { toast } from "sonner";

export function EnhancedLoginForm() {
  const navigate = useNavigate();
  
  // Get redirect parameter from URL search params
  const getRedirectParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect');
  };
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  } as LoginFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<
    null | "email" | "google" | "github"
  >(null);

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
    const result = loginSchema.safeParse(formData);
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

  const handleGoogleSignIn = async () => {
    setIsSubmitting("google");
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google!");
      
      const redirect = getRedirectParam();
      if (redirect && redirect !== "/") {
        navigate({ to: redirect, replace: true });
      } else {
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleGithubSignIn = async () => {
    setIsSubmitting("github");
    try {
      await signInWithGithub();
      toast.success("Signed in with GitHub!");
      
      const redirect = getRedirectParam();
      if (redirect && redirect !== "/") {
        navigate({ to: redirect, replace: true });
      } else {
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with GitHub");
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-2xl border border-border/70 p-8 shadow-elegant">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            SkillVerse Access
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign in to your SkillVerse account to continue
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="mb-6 grid grid-cols-1 gap-2.5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={!!isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-all hover:bg-secondary/60 disabled:opacity-60"
          >
            {isSubmitting === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FaGoogle className="h-4 w-4" />
            )}
            Continue with Google
          </button>

          <button
            type="button"
            onClick={handleGithubSignIn}
            disabled={!!isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-all hover:bg-secondary/60 disabled:opacity-60"
          >
            {isSubmitting === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FaGithub className="h-[18px] w-[18px]" />
            )}
            Continue with GitHub
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            or with email
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

          {/* Password */}
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
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />

          {/* Remember Me & Forgot Password */}
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
              className="text-xs font-medium text-brand hover:underline"
            >
              Forgot password?
            </Link>
          </div>

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
            disabled={isSubmitting === "email"}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand text-brand-foreground text-sm font-semibold shadow-glow transition-transform hover:scale-[1.01] hover:opacity-90 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting === "email" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              "Log in"
            )}
          </button>

          {/* Security Notice */}
          <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-secondary/40 p-3 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand" />
            <span>
              Secured with Firebase Authentication. Your credentials never touch
              our servers directly.
            </span>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/auth"
            className="font-semibold text-brand hover:underline"
          >
            Create account
          </Link>
        </div>
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
    <div className="space-y-1.5 text-left">
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-foreground"
      >
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
          {icon}
        </div>
        <input
          type={type}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`block h-10 w-full rounded-md border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand ${
            error ? "border-destructive focus:border-destructive focus:ring-destructive" : "border-border"
          } ${suffix ? "pr-10" : ""}`}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
