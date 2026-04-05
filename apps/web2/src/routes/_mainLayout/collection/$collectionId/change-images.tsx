import { ChangeImagesView } from "@repo/ui/views/collection/ChangeImagesView";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_mainLayout/collection/$collectionId/change-images",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { collectionId } = Route.useParams();

  return <ChangeImagesView collectionId={collectionId} />;
}
