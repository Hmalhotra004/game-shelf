import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_mainLayout/profile/account-links/playstation",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_mainLayout/profile/account-links/playstation"!</div>;
}
