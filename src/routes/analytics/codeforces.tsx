import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { CodeforcesAnalyticsPage } from "@/components/analytics/CodeforcesAnalyticsPage";

export const Route = createFileRoute("/analytics/codeforces")({
  component: CodeforcesAnalyticsRoute,
});

function CodeforcesAnalyticsRoute() {
  return (
    <PageShell>
      <AuthGate>
        <CodeforcesAnalyticsPage />
      </AuthGate>
    </PageShell>
  );
}
