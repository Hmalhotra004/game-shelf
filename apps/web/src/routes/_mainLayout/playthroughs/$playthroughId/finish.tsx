import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_mainLayout/playthroughs/$playthroughId/finish",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_mainLayout/playthroughs/$playthroughId/finish"!</div>;
}
