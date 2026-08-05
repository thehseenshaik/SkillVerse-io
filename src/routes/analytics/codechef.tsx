import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { CodeChefAnalyticsPage } from "@/components/analytics/CodeChefAnalyticsPage";

export const Route = createFileRoute("/analytics/codechef")({
  component: CodeChefAnalyticsRoute,
});

function CodeChefAnalyticsRoute() {
  return (
    <PageShell>
      <AuthGate>
        <CodeChefAnalyticsPage />
      </AuthGate>
    </PageShell>
  );
}
