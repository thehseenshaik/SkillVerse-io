import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { GitHubProfileView } from "@/components/connections/GitHubProfileView";

export const Route = createFileRoute("/connections/github")({
  head: () => ({
    meta: [
      { title: "GitHub Profile — SkillVerse Career Identity" },
      { name: "description", content: "Your GitHub open-source identity, repositories and contribution telemetry on SkillVerse." },
    ],
  }),
  component: () => (
    <PageShell>
      <AuthGate>
        <GitHubProfileView />
      </AuthGate>
    </PageShell>
  ),
});
