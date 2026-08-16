import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { LinkedInProfileView } from "@/components/connections/LinkedInProfileView";

export const Route = createFileRoute("/connections/linkedin")({
  head: () => ({
    meta: [
      { title: "LinkedIn Profile — SkillVerse Career Identity" },
      { name: "description", content: "Your LinkedIn professional experience and network metrics on SkillVerse." },
    ],
  }),
  component: () => (
    <PageShell>
      <AuthGate>
        <LinkedInProfileView />
      </AuthGate>
    </PageShell>
  ),
});
