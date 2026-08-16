import { createFileRoute } from "@tanstack/react-router";
import { GenericPlatformProfileView } from "@/components/connections/GenericPlatformProfileView";

export const Route = createFileRoute("/connections/$platform")({
  component: GenericPlatformProfileView,
});
