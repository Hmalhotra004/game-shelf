import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/")({
  component: Index,
});

function Index() {
  return (
    <div className="">
      <h3 className=" text-2xl text-blue-500">Welcome Home!</h3>
      <Button>click</Button>
    </div>
  );
}
