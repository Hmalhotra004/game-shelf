import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_adminLayout/backup")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_adminLayout/backup"!</div>;
}
