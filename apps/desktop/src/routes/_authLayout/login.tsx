import LoginView from "@repo/ui/views/auth/LoginView";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authLayout/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const onSuccess = () => {
    navigate({ to: "/", replace: true });
  };

  return (
    <LoginView
      onSuccess={onSuccess}
      Link={Link}
    />
  );
}
