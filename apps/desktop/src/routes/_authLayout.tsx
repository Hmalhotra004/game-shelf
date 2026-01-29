import AuthNavbar from "@repo/ui/components/AuthNavbar";
import { verifySession } from "@repo/ui/lib/verifySession";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authLayout")({
  beforeLoad: async () => {
    const session = await verifySession();

    if (session?.session.id && session.user.id) {
      throw redirect({ to: "/", replace: true });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <AuthNavbar />
      <Outlet />
    </>
  );
}
