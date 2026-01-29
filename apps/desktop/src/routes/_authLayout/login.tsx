import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authLayout/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authLayout/login"!</div>;
}
