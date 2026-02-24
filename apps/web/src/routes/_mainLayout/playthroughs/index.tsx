import { PlaythroughView } from "@repo/ui/views/playthroughs/PlaythroughView";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/playthroughs/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <PlaythroughView
      onFinish={(playthroughId) =>
        navigate({
          to: "/playthroughs/$playthroughId/finish",
          params: { playthroughId },
        })
      }
    />
  );
}
