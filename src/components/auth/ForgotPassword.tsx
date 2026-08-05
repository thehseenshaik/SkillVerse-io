/**
 * Forgot Password Flow Component
 * Handles password reset with rate limiting and security
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
} from "lucide-react";
import {
  sendPasswordReset,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "@/services/auth.service";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";
import { toast } from "sonner";

type Step = "request" | "sent" | "reset" | "success";

// Rate limiting: Store attempt timestamps in localStorage
const RATE_LIMIT_KEY = "skillverse.passwordResetAttempts";
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 3;

const getRateLimitStatus = (): {
  canAttempt: boolean;
  remainingAttempts: number;
  resetTime: number;
} => {
  const attempts = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || "[]");
  const now = Date.now();

  // Filter out attempts outside the rate limit window
  const recentAttempts = attempts.filter(
    (timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW,
  );

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    const oldestAttempt = recentAttempts[0];
    return {
      canAttempt: false,
      remainingAttempts: 0,
      resetTime: oldestAttempt + RATE_LIMIT_WINDOW,
    };
  }

  return {
    canAttempt: true,
    remainingAttempts: MAX_ATTEMPTS - recentAttempts.length,
    resetTime: 0,
  };
};

const recordAttempt = () => {
  const attempts = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || "[]");
  attempts.push(Date.now());
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(attempts));
};

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [rateLimitStatus, setRateLimitStatus] = useState(getRateLimitStatus());

  // Reset password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Check URL for reset code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    const oobCode = urlParams.get("oobCode");

    if (mode === "resetPassword" && oobCode) {
      setStep("reset");
    }
  }, []);

  // Update rate limit status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRateLimitStatus(getRateLimitStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cooldown timer for resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit
    const status = getRateLimitStatus();
    if (!status.canAttempt) {
      toast.error("Too many attempts. Please try again later.");
      return;
    }

    // Validate email
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const formErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        formErrors[path] = issue.message;
      });
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordReset(email);
      recordAttempt();
      setStep("sent");
      setCooldown(60);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get("oobCode");

    if (!oobCode) {
      toast.error("Invalid reset link");
      navigate({ to: "/forgot-password" });
      return;
    }

    // Validate passwords
    const result = resetPasswordSchema.safeParse({
      password: newPassword,
      confirmPassword: confirmPassword,
    });

    if (!result.success) {
      const formErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        formErrors[path] = issue.message;
      });
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(oobCode, newPassword);
      setStep("success");
      toast.success("Password reset successfully!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isSubmitting || !rateLimitStatus.canAttempt) return;

    setIsSubmitting(true);
    try {
      await sendPasswordReset(email);
      recordAttempt();
      setCooldown(60);
      toast.success("Password reset email sent again!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeRemaining = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Request Step
  if (step === "request") {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-elegant">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>

          <div className="text-center mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
              <Lock className="h-10 w-10 text-brand" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Forgot password?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          {/* Rate Limit Warning */}
          {!rateLimitStatus.canAttempt && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Too many attempts</p>
                <p className="mt-1">
                  Please wait{" "}
                  {formatTimeRemaining(rateLimitStatus.resetTime - Date.now())}{" "}
                  before trying again.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleRequestReset} className="space-y-4" noValidate>
            <FormField
              label="Email"
              icon={<Mail className="h-4 w-4" />}
              type="email"
              id="email"
              value={email}
              onChange={setEmail}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            {errors.form && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-2.5 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !rateLimitStatus.canAttempt}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-gradient text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-foreground hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Sent Step
  if (step === "sent") {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-elegant text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <Mail className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a password reset link to{" "}
            <span className="font-semibold text-foreground">{email}</span>
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleResend}
              disabled={
                isSubmitting || cooldown > 0 || !rateLimitStatus.canAttempt
              }
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground shadow-sm transition-all hover:border-foreground/40 hover:bg-secondary/60 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                </>
              ) : cooldown > 0 ? (
                <>
                  <RefreshCw className="h-4 w-4" /> Resend in {cooldown}s
                </>
              ) : !rateLimitStatus.canAttempt ? (
                "Too many attempts"
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> Resend email
                </>
              )}
            </button>

            <button
              onClick={() => setStep("request")}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background text-sm font-medium text-muted-foreground transition-all hover:border-foreground/40 hover:bg-secondary/60"
            >
              Try different email
            </button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or request a new
            link.
          </p>
        </div>
      </div>
    );
  }

  // Reset Step
  if (step === "reset") {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-elegant">
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
              <Lock className="h-10 w-10 text-brand" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Set new password
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a strong password for your account.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
            <FormField
              label="New Password"
              icon={<Lock className="h-4 w-4" />}
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={setNewPassword}
              error={errors.password}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />

            <FormField
              label="Confirm New Password"
              icon={<Lock className="h-4 w-4" />}
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />

            {errors.form && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-2.5 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-gradient text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Resetting...
                </>
              ) : (
                "Reset password"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Success Step
  if (step === "success") {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-elegant text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Password reset successful!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password has been successfully reset. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return null;
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
