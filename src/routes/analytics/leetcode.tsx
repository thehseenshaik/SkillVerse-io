import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { LeetCodeAnalyticsPage } from "@/components/analytics/LeetCodeAnalyticsPage";

export const Route = createFileRoute("/analytics/leetcode")({
  component: LeetCodeAnalyticsRoute,
});

function LeetCodeAnalyticsRoute() {
  return (
    <PageShell>
      <AuthGate>
        <LeetCodeAnalyticsPage />
      </AuthGate>
    </PageShell>
  );
}
