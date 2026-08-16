import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { GenericPlatformProfileView } from "@/components/connections/GenericPlatformProfileView";

export const Route = createFileRoute("/connections/$platform")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.platform.toUpperCase()} Profile — SkillVerse Career Identity` },
      { name: "description", content: `View connected ${params.platform} profile and telemetry metrics on SkillVerse.` },
    ],
  }),
  component: DynamicPlatformRoute,
});

function DynamicPlatformRoute() {
  const { platform } = Route.useParams();
  return (
    <PageShell>
      <AuthGate>
        <GenericPlatformProfileView platform={platform} />
      </AuthGate>
    </PageShell>
  );
}
