import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { GFGProfileView } from "@/components/connections/GFGProfileView";

export const Route = createFileRoute("/connections/gfg")({
  head: () => ({
    meta: [
      { title: "GeeksforGeeks Profile — SkillVerse Career Identity" },
      { name: "description", content: "Your GeeksforGeeks coding score, POTD streak, and problem solving stats on SkillVerse." },
    ],
  }),
  component: () => (
    <PageShell>
      <AuthGate>
        <GFGProfileView />
      </AuthGate>
    </PageShell>
  ),
});
