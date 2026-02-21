import { ChangeCardVariantView } from "@repo/ui/views/profile/ChangeCardVariantView";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/profile/change-variant")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ChangeCardVariantView />;
}
