import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/collection/$collectionId/")({
  loader: ({ params }) => {
    console.log(params.collectionId);
  },

  component: RouteComponent,
});

function RouteComponent() {
  const { collectionId } = useParams({
    from: "/_mainLayout/collection/$collectionId/",
  });

  return <div>Hello "/_mainLayout/collection/$collectionId/"!</div>;
}
