import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/authClient";

export const Route = createFileRoute("/_mainLayout/profile/account-links/epic")(
  {
    component: RouteComponent,
  },
);

function RouteComponent() {
  const login = async () => {
    await authClient.signIn.oauth2({
      providerId: "EPIC",
      callbackURL: "/",
    });
  };
  return (
    <div>
      <Button onClick={login}>login</Button>
    </div>
  );
}
