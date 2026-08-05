import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { GFGAnalyticsPage } from "@/components/analytics/GFGAnalyticsPage";

export const Route = createFileRoute("/analytics/gfg")({
  component: GFGAnalyticsRoute,
});

function GFGAnalyticsRoute() {
  return (
    <PageShell>
      <AuthGate>
        <GFGAnalyticsPage />
      </AuthGate>
    </PageShell>
  );
}
