import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/SiteChrome";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  return (
    <PageShell>
      <div className="flex min-h-[calc(100dvh-14rem)] flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <Shield className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            You don't have permission to access this page. Please sign in or
            contact support if you believe this is an error.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/login" className="inline-flex">
              <Button className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link to="/" className="inline-flex">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
