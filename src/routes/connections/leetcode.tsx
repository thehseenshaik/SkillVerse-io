import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { LeetCodeProfileView } from "@/components/connections/LeetCodeProfileView";

export const Route = createFileRoute("/connections/leetcode")({
  head: () => ({
    meta: [
      { title: "LeetCode Profile — SkillVerse Career Identity" },
      { name: "description", content: "Your LeetCode problem-solving progress, contest rating, and DSA activity on SkillVerse." },
    ],
  }),
  component: () => (
    <PageShell>
      <AuthGate>
        <LeetCodeProfileView />
      </AuthGate>
    </PageShell>
  ),
});
