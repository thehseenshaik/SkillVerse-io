import { createRoot } from "react-dom/client";
import { createRouter } from "@tanstack/react-router";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useEffect } from "react";
import { initializeSessionManagement } from "@/lib/session";
import { initializeTheme } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth-context";
import { IdentityHubProvider } from "@/lib/identity-hub-context";

// Handle browser extension conflicts gracefully
if (typeof window !== "undefined") {
  // Patterns to suppress from browser extensions
  const suppressPatterns = [
    'MaxListenersExceededWarning',
    'ObjectMultiplex',
    'ethereum',
    'Backpack',
    'orphaned data',
    'close listeners',
    'end listeners',
    'app-init-liveness',
    'background-liveness',
    'Cross-Origin-Opener-Policy',
    'window.close',
    'contentscript.js',
    'injected.js',
    'evmAsk.js',
    'Cannot redefine property',
    'A listener indicated an asynchronous response'
  ];

  // Suppress wallet extension errors in console
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const fullArgs = args.join(' ');
    if (suppressPatterns.some(pattern => fullArgs.includes(pattern))) {
      return; // Suppress extension-related warnings
    }
    originalWarn.apply(console, args);
  };

  // Suppress extension errors in console.error as well
  const originalError = console.error;
  console.error = (...args) => {
    const fullArgs = args.join(' ');
    if (suppressPatterns.some(pattern => fullArgs.includes(pattern))) {
      return; // Suppress extension-related errors
    }
    originalError.apply(console, args);
  };

  // Suppress extension logs in console.log as well
  const originalLog = console.log;
  console.log = (...args) => {
    const fullArgs = args.join(' ');
    if (suppressPatterns.some(pattern => fullArgs.includes(pattern))) {
      return; // Suppress extension-related logs
    }
    originalLog.apply(console, args);
  };

  // Increase EventEmitter max listeners to prevent memory leak warnings
  if (typeof process !== "undefined" && typeof (process as any)?.setMaxListeners === "function") {
    (process as any).setMaxListeners(50);
  }
}

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a QueryClient instance
const queryClient = new QueryClient();

// Create a new router instance with context
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: false,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Session Management Component
function SessionManager() {
  useEffect(() => {
    const cleanupSession = initializeSessionManagement();
    initializeTheme();

    // Cleanup function to prevent memory leaks
    return () => {
      cleanupSession?.();
    };
  }, []);

  return null;
}

import { ProfileProvider } from "@/lib/profile-context";

// Render the app
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <AuthProvider>
      <ProfileProvider>
        <IdentityHubProvider>
          <SessionManager />
          <RouterProvider router={router} />
          <Toaster />
        </IdentityHubProvider>
      </ProfileProvider>
    </AuthProvider>
  </ErrorBoundary>,
);
