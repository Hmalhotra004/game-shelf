import { verifySession } from "@repo/ui/lib/verifySession";
import LoginView from "@repo/ui/views/auth/LoginView";

import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_authLayout/login")({
  beforeLoad: async () => {
    const session = await verifySession();

    if (session?.session.id && session.user.id) {
      throw redirect({ to: "/", replace: true });
    }
  },
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
      renderForgotLink={(children) => (
        <Link to="/forgot-password">{children}</Link>
      )}
      rendersignLink={(children) => <Link to="/sign-up">{children}</Link>}
    />
  );
}
