import { CollectionView } from "@repo/ui/views/collection/CollectionView";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/collection")({
  // loader: async ({ context }) => {
  //   await context.queryClient.prefetchQuery(collectionGetManyQueryOptions());
  // },
  component: App,
});

function App() {
  return <CollectionView Link={Link} />;
}
