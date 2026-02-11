import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/playthroughs/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_mainLayout/playthrough/"!</div>;
}
