import { verifySession } from "@repo/ui/lib/verifySession";
import SignupView from "@repo/ui/views/auth/SignupView";

import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_authLayout/sign-up")({
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
    <SignupView
      renderLink={(children) => <Link to="/login">{children}</Link>}
      onSuccess={onSuccess}
    />
  );
}
