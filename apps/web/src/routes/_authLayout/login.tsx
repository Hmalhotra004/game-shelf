import LoginView from "@repo/ui/views/auth/LoginView";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authLayout/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const onSuccess = () => {
    throw redirect({ to: "/", replace: true });
  };

  return <LoginView onSuccess={onSuccess} />;
}
