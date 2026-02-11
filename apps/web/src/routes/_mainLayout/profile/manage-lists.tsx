import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/profile/manage-lists")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_mainLayout/profile/manage-lists"!</div>;
}
