import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/SiteChrome";

export const Route = createFileRoute("/error")({
  component: ErrorPage,
});

function ErrorPage() {
  return (
    <PageShell>
      <div className="flex min-h-[calc(100dvh-14rem)] flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            We encountered an unexpected error. Please try again later or
            contact support if the problem persists.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
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
