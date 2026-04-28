import { SearchGame } from "@repo/schemas/types/igdb";
import { queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

export const IGDBQueryKeys = {
  all: ["IGDB"] as const,

  search: (submitted: string) =>
    [...IGDBQueryKeys.all, "search", submitted] as const,
};

export const searchGameQueryOptions = (
  api: AxiosInstance,
  enabled: boolean,
  submitted: string,
) =>
  queryOptions({
    queryKey: IGDBQueryKeys.search(submitted),
    queryFn: async () => {
      const response = await api.get<SearchGame>("/igdb/search", {
        params: { query: submitted },
      });

      return response.data;
    },
    enabled,
  });
