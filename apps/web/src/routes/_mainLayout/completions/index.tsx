import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/completions/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_mainLayout/completions/"!</div>;
}
