import { queryOptions } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { CollectionQueryKeys } from "./collection.keys";

import {
  CollectionGetById,
  CollectionGetMany,
} from "@repo/schemas/types/collection";

export const collectionGetManyQueryOptions = () =>
  queryOptions({
    queryKey: CollectionQueryKeys.getMany(),
    queryFn: async () => {
      const response =
        await api.get<Array<CollectionGetMany>>(`/collection/getMany`);

      return response.data;
    },
  });

export const collectionGetByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: CollectionQueryKeys.getById(id),
    queryFn: async () => {
      const response = await api.get<Array<CollectionGetById>>(
        `/collection/${id}`,
      );

      return response.data;
    },
  });
