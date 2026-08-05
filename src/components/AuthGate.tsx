import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { PageLoader } from "@/components/PageLoader";
import { fbAuth } from "@/lib/firebase";

/**
 * Client-side redirect guard for authentication.
 * Enforces email verification in production and redirects unauthenticated users.
 * Only redirects after auth state is fully resolved to prevent redirect loops.
 */
export function AuthGate({
  children,
  requireVerified = true,
  requireOnboarding = false,
}: {
  children: ReactNode;
  requireVerified?: boolean;
  requireOnboarding?: boolean;
}) {
  const { isAuthenticated, hydrated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect while auth state is still loading
    if (!hydrated) {
      console.log("[AuthGate] Auth state not yet hydrated, waiting...");
      return;
    }

    console.log("[AuthGate] Auth state resolved:", { isAuthenticated, user: user?.email });

    // Only redirect if definitely not authenticated
    if (!isAuthenticated) {
      console.log("[AuthGate] User not authenticated, redirecting to login");
      
      // Preserve return URL for deep linking using query param
      const returnTo = window.location.pathname + window.location.search;
      if (returnTo !== "/login" && returnTo !== "/") {
        navigate({ 
          to: "/login?redirect=" + encodeURIComponent(returnTo),
          replace: true 
        });
      } else {
        navigate({ to: "/login", replace: true });
      }
      return;
    }

    // Check email verification in production
    if (requireVerified) {
      const fbUser = fbAuth().currentUser;
      const isProduction = import.meta.env.MODE === "production";

      if (fbUser && !fbUser.emailVerified && isProduction) {
        console.log("[AuthGate] Email not verified, redirecting to verify-email");
        navigate({ to: "/verify-email" as any, replace: true });
        return;
      }
    }

    // Check onboarding completion when implemented
    if (requireOnboarding && user) {
      // TODO: Add onboarding check once onboarding flow is integrated
      // const userDoc = await getUserDocument(user.id);
      // if (!userDoc?.metadata.onboardingCompleted) {
      //   navigate({ to: "/onboarding", replace: true });
      //   return;
      // }
    }
  }, [
    hydrated,
    isAuthenticated,
    navigate,
    requireVerified,
    requireOnboarding,
    user,
  ]);

  // Show loading state while auth is resolving
  if (!hydrated) {
    return <PageLoader label="Loading your session…" />;
  }

  // Only show loading redirect if definitely not authenticated
  if (!isAuthenticated) {
    return <PageLoader label="Redirecting to sign in…" />;
  }

  return <>{children}</>;
}
