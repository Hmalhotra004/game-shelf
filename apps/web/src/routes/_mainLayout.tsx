import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import { authClient } from "@/lib/authClient";
import { socket } from "@/lib/socket";

export const Route = createFileRoute("/_mainLayout")({
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (session.data === null) {
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
  useEffect(() => {
    const handleError = (error: string) => {
      toast.error(error);
    };

    socket.on("error_message", handleError);

    return () => {
      socket.off("error_message", handleError);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />

      <main className="flex flex-col flex-1 p-4 min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
