import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";

export const Route = createFileRoute("/connections")({
  component: ConnectionsLayout,
});

function ConnectionsLayout() {
  return (
    <PageShell>
      <AuthGate>
        <Outlet />
      </AuthGate>
    </PageShell>
  );
}
