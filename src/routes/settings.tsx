import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { AccountSettings } from "@/components/auth/AccountSettings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SkillVerse" },
      {
        name: "description",
        content:
          "Theme, security and account preferences for your SkillVerse workspace.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Settings — SkillVerse" },
      {
        property: "og:description",
        content: "Manage your SkillVerse workspace.",
      },
    ],
  }),
  component: () => (
    <PageShell>
      <AuthGate>
        <AccountSettings />
      </AuthGate>
    </PageShell>
  ),
});
