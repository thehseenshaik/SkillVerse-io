/**
 * Email Verification Flow Component
 * Handles email verification UI and resend functionality
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { sendVerificationEmail, verifyEmail } from "@/services/auth.service";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { fbAuth } from "@/lib/firebase";

export function EmailVerification() {
  const navigate = useNavigate();
  const { user, hydrated } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Check if user is already verified
    const fbUser = fbAuth().currentUser;
    if (fbUser?.emailVerified) {
      setIsVerified(true);
    }

    // Handle URL action code for email verification
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    const actionCode = urlParams.get("oobCode");

    if (mode === "verifyEmail" && actionCode) {
      handleVerification(actionCode);
    }
  }, [user]);

  useEffect(() => {
    // Cooldown timer for resend button
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleVerification = async (actionCode: string) => {
    try {
      await verifyEmail(actionCode);
      setIsVerified(true);
      toast.success("Email verified successfully!");

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate({ to: "/dashboard", replace: true });
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to verify email");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isSending) return;

    setIsSending(true);
    try {
      await sendVerificationEmail();
      toast.success("Verification email sent!");
      setCooldown(60); // 60 second cooldown
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setIsSending(false);
    }
  };

  const handleSkip = () => {
    navigate({ to: "/dashboard", replace: true });
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-elegant text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Email Verified!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your email has been successfully verified. Redirecting to
            dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="glass rounded-3xl p-8 shadow-elegant">
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
            <Mail className="h-10 w-10 text-brand" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a verification link to{" "}
            <span className="font-semibold text-foreground">{user?.email}</span>
          </p>
        </div>

        <div className="space-y-4">
          {/* Info Box */}
          <div className="rounded-lg border border-border/70 bg-secondary/40 p-4 text-xs text-muted-foreground">
            <p className="mb-2">
              <strong>Why verify?</strong> Email verification helps us:
            </p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Protect your account from unauthorized access</li>
              <li>Enable important security features</li>
              <li>Ensure you receive important notifications</li>
              <li>Unlock full access to all features</li>
            </ul>
          </div>

          {/* Warning Box */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-200/50 bg-amber-50/50 p-3 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              Some features will be restricted until you verify your email. You
              can verify later from your account settings.
            </p>
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResend}
            disabled={isSending || cooldown > 0}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground shadow-sm transition-all hover:border-foreground/40 hover:bg-secondary/60 disabled:opacity-60"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending...
              </>
            ) : cooldown > 0 ? (
              <>
                <RefreshCw className="h-4 w-4" /> Resend in {cooldown}s
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> Resend verification email
              </>
            )}
          </button>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background text-sm font-medium text-muted-foreground transition-all hover:border-foreground/40 hover:bg-secondary/60"
          >
            Skip for now
          </button>

          {/* Help Text */}
          <p className="text-center text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={handleResend}
              disabled={isSending || cooldown > 0}
              className="text-brand hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
            >
              resend
            </button>
          </p>
        </div>

        {/* Back to Login */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already verified?{" "}
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
