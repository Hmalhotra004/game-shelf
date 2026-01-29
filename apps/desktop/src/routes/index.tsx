import { Button } from "@repo/ui/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3 className="text-9xl">Welcome Home!</h3>
      <Button variant="destructive">click</Button>
      <Link to="/login">login</Link>
    </div>
  );
}
