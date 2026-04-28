import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/collection/add")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "number" ? search.id : Number(search.id) || null,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useSearch();

  return <div>Hello "/_mainLayout/collection/add"!</div>;
}
