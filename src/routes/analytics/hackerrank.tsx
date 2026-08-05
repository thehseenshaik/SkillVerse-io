import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { HackerRankAnalyticsPage } from "@/components/analytics/HackerRankAnalyticsPage";

export const Route = createFileRoute("/analytics/hackerrank")({
  component: HackerRankAnalyticsRoute,
});

function HackerRankAnalyticsRoute() {
  return (
    <PageShell>
      <AuthGate>
        <HackerRankAnalyticsPage />
      </AuthGate>
    </PageShell>
  );
}
