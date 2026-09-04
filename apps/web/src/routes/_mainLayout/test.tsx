import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { api } from "@/lib/api";

export const Route = createFileRoute("/_mainLayout/test")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["idgb"],
    queryFn: async () => {
      const response = await api.get("/igdb/test", {
        params: { query: "cuphead" },
      });

      return response.data;
    },
  });

  if (isLoading) {
    return <Loader2 />;
  }

  console.log(data);

  return <div>Hello "/_mainLayout/test"!dsds</div>;
}
