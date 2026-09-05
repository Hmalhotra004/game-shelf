import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/collection/add")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_mainLayout/collection/add"!</div>;
}
