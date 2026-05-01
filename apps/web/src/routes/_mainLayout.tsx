import { useEffect } from "react";
import { toast } from "sonner";

import {
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from "@tanstack/react-router";

import Navbar from "@/components/Navbar";
import { authClient } from "@/lib/authClient";
import { socket } from "@/lib/socket";
import { cn } from "@/lib/utils";

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
  const { location } = useRouterState();

  const noPaddingRoutes = ["/collection/add"];
  const noPadding = noPaddingRoutes.includes(location.pathname);

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

      <main
        className={cn(
          "flex flex-col flex-1 min-h-0 overflow-hidden",
          !noPadding && "p-4",
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
