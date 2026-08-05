import { createFileRoute } from "@tanstack/react-router";
import { EmailVerification } from "@/components/auth/EmailVerification";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Verify email — SkillVerse" },
      {
        name: "description",
        content:
          "Verify your email address to complete your SkillVerse account setup.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Verify email — SkillVerse" },
      {
        property: "og:description",
        content: "Complete your account verification.",
      },
    ],
  }),
  component: EmailVerificationPage,
});

function EmailVerificationPage() {
  return <EmailVerification />;
}
