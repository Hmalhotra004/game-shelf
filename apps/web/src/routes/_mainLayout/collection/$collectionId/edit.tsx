import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_mainLayout/collection/$collectionId/edit",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_mainLayout/collection/$collectionId/edit"!</div>;
}
