import { createFileRoute } from "@tanstack/react-router";
import { ForgotPassword } from "@/components/auth/ForgotPassword";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — SkillVerse" },
      {
        name: "description",
        content:
          "Reset your SkillVerse password. We'll email you a secure reset link.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Forgot password — SkillVerse" },
      {
        property: "og:description",
        content: "Recover access to your Career Command Center.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return <ForgotPassword />;
}
