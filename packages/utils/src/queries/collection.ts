import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

import {
  CollectionGetById,
  CollectionGetByIdForEdit,
  CollectionGetManyFilters,
  CollectionGetManyResponse,
} from "@repo/schemas/types/collection";

export const CollectionQueryKeys = {
  all: ["Collection"] as const,

  getManyAll: () => ["collection", "getMany"] as const,

  getMany: (filters: CollectionGetManyFilters = {}) =>
    ["collection", "getMany", filters] as const,

  getByIdAll: (id: string) =>
    [...CollectionQueryKeys.all, "getById", id] as const,
  getById: (id: string, edit: boolean = false) =>
    [...CollectionQueryKeys.all, "getById", id, edit] as const,

  linkSteamGrid: (name: string) =>
    [...CollectionQueryKeys.all, "linkSteamGrid", name] as const,
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
    queryKey: CollectionQueryKeys.getById(id, false),
    queryFn: async () => {
      const response = await api.get<CollectionGetById>(`/collection/${id}`);

      return response.data;
    },
  });

export const collectionGetByIdForEditQueryOptions = (
  api: AxiosInstance,
  id: string,
) =>
  queryOptions({
    queryKey: CollectionQueryKeys.getById(id, true),
    queryFn: async () => {
      const response = await api.get<CollectionGetByIdForEdit>(
        `/collection/${id}/edit`,
      );

      return response.data;
    },
  });
