import Navbar from "@/components/Navbar";
import { getSession } from "@/lib/getSession";
import { cn } from "@/lib/utils";

import {
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout")({
  beforeLoad: async () => {
    // TODO: switch to client side fetch
    const session = await getSession();

    if (session === null) {
      throw redirect({ to: "/login", replace: true });
    }

    if (!session.user.emailVerified) {
      throw redirect({
        to: "/email-verification",
        search: { email: session.user.email },
        replace: true,
      });
    }

    return session.user;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { location } = useRouterState();

  const noPaddingRoutes = ["/collection/add"];
  const noPadding = noPaddingRoutes.includes(location.pathname);

  // useEffect(() => {
  //   const handleError = (error: string) => {
  //     toast.error(error);
  //   };

  //   socket.on("error_message", handleError);

  //   return () => {
  //     socket.off("error_message", handleError);
  //   };
  // }, []);

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
