import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/profile/platinum-list")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_mainLayout/profile/platinum-list"!</div>;
}
