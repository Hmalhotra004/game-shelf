import Navbar from "@/components/Navbar";
import { authClient } from "@/lib/authClient";

import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout")({
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (!session.data) {
      throw redirect({ to: "/login", replace: true });
    }

    if (!session.data.user.emailVerified) {
      throw redirect({
        to: "/email-verification",
        search: { email: session.data.user.email },
        replace: true,
      });
    }

    return session.data.user;
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />

      <main className="flex flex-col flex-1 p-4 min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
