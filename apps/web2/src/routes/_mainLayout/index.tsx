import { HomeView } from "@repo/ui/views/HomeView";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/")({
  component: App,
});

function App() {
  return <HomeView />;
}
