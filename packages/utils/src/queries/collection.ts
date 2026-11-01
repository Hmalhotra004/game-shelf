import { TrophiesResponse } from "@repo/schemas/types/trophies";
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

  getManyAll: () => [...CollectionQueryKeys.all, "getMany"] as const,

  getMany: (filters: CollectionGetManyFilters = {}) =>
    [...CollectionQueryKeys.all, "getMany", filters] as const,

  getByIdAll: (id: string) =>
    [...CollectionQueryKeys.all, "getById", id] as const,
  getById: (id: string, edit: boolean = false) =>
    [...CollectionQueryKeys.all, "getById", id, edit] as const,

  getSteamAchievements: (id: string) =>
    [...CollectionQueryKeys.all, "getSteamAchievements", id] as const,

  getPSNTrophies: (id: string) =>
    [...CollectionQueryKeys.all, "getPSNTrophies", id] as const,

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

export const collectionGetSteamAchievementsQueryOptions = (
  api: AxiosInstance,
  id: string,
) =>
  queryOptions({
    queryKey: CollectionQueryKeys.getSteamAchievements(id),
    queryFn: async () => {
      const response = await api.get<TrophiesResponse[]>(
        `/collection/${id}/steam/achievements`,
      );

      return response.data;
    },
  });

export const collectionGetPSNTrophiesQueryOptions = (
  api: AxiosInstance,
  id: string,
) =>
  queryOptions({
    queryKey: CollectionQueryKeys.getPSNTrophies(id),
    queryFn: async () => {
      const response = await api.get<TrophiesResponse[]>(
        `/collection/${id}/psn/trophies`,
      );

      return response.data;
    },
  });
