import { SettingsView } from "@repo/ui/views/profile/SettingsView";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/profile/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SettingsView
      renderLink={(to, children) => <Link to={to}>{children}</Link>}
    />
  );
}
