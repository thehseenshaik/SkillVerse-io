import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { AssistantPage } from "@/routes/assistant";

export const Route = createFileRoute("/copilot")({
  head: () => ({
    meta: [
      { title: "Copilot — SkillVerse AI Career Assistant" },
      {
        name: "description",
        content:
          "Your AI career assistant for skills, resumes and career decisions.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <AssistantPage />
    </AuthGate>
  ),
});
