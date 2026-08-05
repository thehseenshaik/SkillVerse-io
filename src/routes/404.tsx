import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/SiteChrome";

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <PageShell>
      <div className="flex min-h-[calc(100dvh-14rem)] flex-col items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-9xl font-extrabold text-gradient">404</h1>
          <h2 className="mt-4 text-2xl font-semibold text-foreground">
            Page not found
          </h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            The page you're looking for doesn't exist or has been moved to a
            different location.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/" className="inline-flex">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
