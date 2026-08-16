import { createFileRoute } from "@tanstack/react-router";
import { LinkedInProfileView } from "@/components/connections/LinkedInProfileView";

export const Route = createFileRoute("/connections/linkedin")({
  head: () => ({
    meta: [
      { title: "LinkedIn Profile — SkillVerse Career Identity" },
      { name: "description", content: "Your LinkedIn professional identity and verified industry credentials on SkillVerse." },
    ],
  }),
  component: LinkedInProfileView,
});
