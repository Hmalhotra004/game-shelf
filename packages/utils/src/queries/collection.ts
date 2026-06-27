export const CollectionQueryKeys = {
  all: ["Collection"] as const,

  getMany: () => [...CollectionQueryKeys.all, "getMany"] as const,

  getById: (id: string) => [...CollectionQueryKeys.all, "getById", id],

  linkSteamGrid: (name: string) => [
    ...CollectionQueryKeys.all,
    "linkSteamGrid",
    name,
  ],
};

import { queryOptions } from "@tanstack/react-query";

import {
  CollectionGetById,
  CollectionGetMany,
} from "@repo/schemas/types/collection";
import { AxiosInstance } from "axios";

export const collectionGetManyQueryOptions = (api: AxiosInstance) =>
  queryOptions({
    queryKey: CollectionQueryKeys.getMany(),
    queryFn: async () => {
      const response =
        await api.get<Array<CollectionGetMany>>(`/collection/getMany`);

      return response.data;
    },
  });

export const collectionGetByIdQueryOptions = (api: AxiosInstance, id: string) =>
  queryOptions({
    queryKey: CollectionQueryKeys.getById(id),
    queryFn: async () => {
      const response = await api.get<CollectionGetById>(`/collection/${id}`);

      return response.data;
    },
  });
