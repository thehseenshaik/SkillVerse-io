import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { GitHubAnalyticsPage } from "@/components/analytics/GitHubAnalyticsPage";

export const Route = createFileRoute("/analytics/github")({
  component: GitHubAnalyticsRoute,
});

function GitHubAnalyticsRoute() {
  return (
    <PageShell>
      <AuthGate>
        <GitHubAnalyticsPage />
      </AuthGate>
    </PageShell>
  );
}
