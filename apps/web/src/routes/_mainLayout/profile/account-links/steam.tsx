import { createFileRoute } from "@tanstack/react-router";

import { Card } from "@/components/ui/card";

export const Route = createFileRoute(
  "/_mainLayout/profile/account-links/steam",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <Card className="mx-auto w-full"></Card>;
}
