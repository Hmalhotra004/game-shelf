import { queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

import {
  GetByIdClientResponse,
  SearchGameClientResponse,
} from "@repo/schemas/types/igdb";

export const IGDBQueryKeys = {
  all: ["IGDB"] as const,

  search: (submitted: string) =>
    [...IGDBQueryKeys.all, "search", submitted] as const,

  getById: (id: number) => [...IGDBQueryKeys.all, "getById", id] as const,
};

export const searchGameQueryOptions = (
  api: AxiosInstance,
  enabled: boolean,
  submitted: string,
) =>
  queryOptions({
    queryKey: IGDBQueryKeys.search(submitted),
    queryFn: async () => {
      const response = await api.get<SearchGameClientResponse>("/igdb/search", {
        params: { query: submitted },
      });

      return response.data;
    },
    enabled,
  });

export const getByIdQueryOptions = (api: AxiosInstance, id: number) =>
  queryOptions({
    queryKey: IGDBQueryKeys.getById(id),
    queryFn: async () => {
      const response = await api.get<GetByIdClientResponse>(`/igdb/${id}`);

      return response.data;
    },
  });
