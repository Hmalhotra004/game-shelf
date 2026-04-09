import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authLayout/email-verification")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authLayout/email-verification"!</div>;
}
