import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/")({
  component: App,
});

function App() {
  return <div className="text-center">hello world</div>;
}
