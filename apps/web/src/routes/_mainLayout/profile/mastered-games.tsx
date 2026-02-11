import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/profile/mastered-games")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_mainLayout/profile/mastered-games"!</div>;
}
