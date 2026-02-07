import {
  mutationOptions,
  QueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { CollectionQueryKeys } from "./collection.keys";

import {
  CollectionGetById,
  CollectionGetMany,
} from "@repo/schemas/types/collection";
import { StatsQueryKeys } from "../stats/stats.keys";

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

// mutations
export const collectionDeleteMutationOptions = (
  collectionId: string,
  queryClient: QueryClient,
) =>
  mutationOptions({
    mutationFn: async () => {
      await api.delete(`/collection/${collectionId}/delete`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CollectionQueryKeys.getMany(),
      });
      await queryClient.invalidateQueries({
        queryKey: StatsQueryKeys.getStats(),
      });

      toast.success("Game deleted successfully");
    },
    onError: (e) => toast.error(e.message),
  });
