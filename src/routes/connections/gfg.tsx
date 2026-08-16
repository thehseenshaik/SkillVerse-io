import { createFileRoute } from "@tanstack/react-router";
import { GFGProfileView } from "@/components/connections/GFGProfileView";

export const Route = createFileRoute("/connections/gfg")({
  head: () => ({
    meta: [
      { title: "GeeksforGeeks Profile — SkillVerse Career Identity" },
      { name: "description", content: "Your GeeksforGeeks POTD streak, problem-solving score, and DSA activity on SkillVerse." },
    ],
  }),
  component: GFGProfileView,
});
