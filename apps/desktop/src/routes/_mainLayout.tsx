import { verifySession } from "@repo/ui/lib/verifySession";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout")({
  beforeLoad: async () => {
    const session = await verifySession();

    if (!session) {
      return redirect({ to: "/login", replace: true });
    }

    return session;
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
