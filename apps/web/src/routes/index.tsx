import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3 className="p-4 text-2xl text-blue-500">Welcome Home!</h3>
      <Button>click</Button>
    </div>
  );
}
