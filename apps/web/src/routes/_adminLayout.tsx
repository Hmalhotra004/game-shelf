import Navbar from "@repo/ui/components/Navbar";
import { authClient } from "@repo/ui/lib/authClient";
import { verifySession } from "@repo/ui/lib/verifySession";

import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_adminLayout")({
  beforeLoad: async () => {
    const session = await verifySession();

    if (!session) {
      throw redirect({ to: "/login", replace: true });
    }

    if (!session.user.emailVerified) {
      throw redirect({
        to: "/email-verification",
        search: { email: session.user.email },
        replace: true,
      });
    }

    if (session.user.userAccountType !== "Admin")
      throw redirect({
        to: "/",
        replace: true,
      });

    return session.user;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const logout = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/", replace: true }) },
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        Link={Link}
        onLogout={logout}
        pathname={pathname}
      />

      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
