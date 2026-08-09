import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/identity-hub")({
  beforeLoad: () => {
    throw redirect({
      to: "/connections",
      replace: true,
    });
  },
  component: () => null,
});
