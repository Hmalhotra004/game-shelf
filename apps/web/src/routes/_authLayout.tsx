import AuthNavbar from "@repo/ui/components/AuthNavbar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authLayout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col min-h-screen">
      <AuthNavbar />
      <div className="flex flex-col mt-20 justify-center items-center">
        <Outlet />
      </div>
    </div>
  );
}
