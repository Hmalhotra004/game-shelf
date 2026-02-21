import { CollectionView } from "@repo/ui/views/collection/CollectionView";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/collection/")({
  // loader: async ({ context }) => {
  //   await context.queryClient.prefetchQuery(collectionGetManyQueryOptions());
  // },
  component: App,
});

function App() {
  const navigate = useNavigate();

  return (
    <CollectionView
      renderLink={(children, game) => (
        <Link
          to={`/collection/$collectionId`}
          params={{ collectionId: game.id }}
          search={{ provider: game.provider }}
        >
          {children}
        </Link>
      )}
      renderImportLink={(children) => (
        <Link to={`/profile/connections`}>{children}</Link>
      )}
      renderContextMenuActions={{
        onEdit: (game) =>
          void navigate({
            to: `/collection/$collectionId/edit`,
            params: { collectionId: game.id },
          }),
        onChangeImages: (game) =>
          void navigate({
            to: `/collection/$collectionId/change-images`,
            params: { collectionId: game.id },
          }),
      }}
    />
  );
}
