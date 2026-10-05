import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

import {
  CollectionGetById,
  CollectionGetManyFilters,
  CollectionGetManyResponse,
} from "@repo/schemas/types/collection";

export const CollectionQueryKeys = {
  all: ["Collection"] as const,

  getManyAll: () => ["collection", "getMany"] as const,

  getMany: (filters: CollectionGetManyFilters = {}) =>
    ["collection", "getMany", filters] as const,

  getById: (id: string) => [...CollectionQueryKeys.all, "getById", id],

  linkSteamGrid: (name: string) => [
    ...CollectionQueryKeys.all,
    "linkSteamGrid",
    name,
  ],
};

const DEFAULT_LIMIT = 20;
export const collectionGetManyQueryOptions = (
  api: AxiosInstance,
  filters: CollectionGetManyFilters = {},
) =>
  infiniteQueryOptions({
    queryKey: CollectionQueryKeys.getMany(filters),

    queryFn: async ({ pageParam, signal }) => {
      const { limit = DEFAULT_LIMIT, ...rest } = filters;

      const response = await api.query<CollectionGetManyResponse>(
        `/collection`,
        { ...rest, page: pageParam, limit },
        { signal },
      );

      return response.data;
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });

export const collectionGetByIdQueryOptions = (api: AxiosInstance, id: string) =>
  queryOptions({
    queryKey: CollectionQueryKeys.getById(id),
    queryFn: async () => {
      const response = await api.get<CollectionGetById>(`/collection/${id}`);

      return response.data;
    },
  });
