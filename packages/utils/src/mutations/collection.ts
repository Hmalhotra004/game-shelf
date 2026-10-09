import { CollectionGetManyResponse } from "@repo/schemas/types/collection";
import { CollectionQueryKeys } from "@repo/utils/queries/collection";
import { StatsQueryKeys } from "@repo/utils/queries/stats";
import { AxiosInstance } from "axios";

import {
  CreateCollectionSchemaType,
  UpdateCollectionSchemaType,
} from "@repo/schemas/schemas/collection";

import {
  InfiniteData,
  mutationOptions,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";

// --------------------- Types------------------------------------
type CollectionInfinite = InfiniteData<CollectionGetManyResponse>;

type ArchiveContext = {
  previous: [QueryKey, CollectionInfinite | undefined][];
};

type DeleteContext = {
  previous: [QueryKey, CollectionInfinite | undefined][];
};

// --------------------Mutations--------------------------

export const addCollectionMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions({
    mutationFn: async (data: CreateCollectionSchemaType) => {
      await api.post("/collection", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: StatsQueryKeys.getStats(),
      });
      await queryClient.invalidateQueries({
        queryKey: CollectionQueryKeys.getManyAll(),
      });
      onSuccess?.();
    },
    onError: (err) => onError(err),
  });

export const updateCollectionMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  collectionId: string,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions({
    mutationFn: async (data: UpdateCollectionSchemaType) => {
      await api.patch(`/collection/${collectionId}/update`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: StatsQueryKeys.getStats(),
      });
      await queryClient.invalidateQueries({
        queryKey: CollectionQueryKeys.getByIdAll(collectionId),
      });
      await queryClient.invalidateQueries({
        queryKey: CollectionQueryKeys.getManyAll(),
      });
      onSuccess?.();
    },
    onError: (err) => onError(err),
  });

export const archiveCollectionMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions<void, Error, string, ArchiveContext>({
    mutationFn: async (id: string) => {
      await api.patch(`/collection/${id}/archive`);
    },

    onMutate: async (id) => {
      const key = CollectionQueryKeys.getManyAll();

      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueriesData<CollectionInfinite>({
        queryKey: key,
      });

      queryClient.setQueriesData<CollectionInfinite>(
        { queryKey: key },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => {
              const items = page.items.filter((item) => item.id !== id);
              const removed = page.items.length - items.length;

              return {
                ...page,
                items,
                total: Math.max(0, page.total - removed),
              };
            }),
          };
        },
      );

      return { previous };
    },

    onError: (err, _id, context) => {
      context?.previous.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      onError(err);
    },

    onSuccess: () => {
      onSuccess?.();
    },

    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: StatsQueryKeys.getStats() }),
        queryClient.invalidateQueries({
          queryKey: CollectionQueryKeys.getManyAll(),
        }),
        // TODO: add playthorugh and completion key as well and archived getmany key as well
      ]);
    },
  });

export const deleteCollectionMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions<void, Error, string, DeleteContext>({
    mutationFn: async (id: string) => {
      await api.delete(`/collection/${id}`);
    },

    onMutate: async (id) => {
      const key = CollectionQueryKeys.getManyAll();

      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueriesData<CollectionInfinite>({
        queryKey: key,
      });

      queryClient.setQueriesData<CollectionInfinite>(
        { queryKey: key },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => {
              const items = page.items.filter((item) => item.id !== id);
              const removed = page.items.length - items.length;

              return {
                ...page,
                items,
                total: Math.max(0, page.total - removed),
              };
            }),
          };
        },
      );

      return { previous };
    },

    onError: (err, _id, context) => {
      context?.previous.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      onError(err);
    },

    onSuccess: () => {
      onSuccess?.();
    },

    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: StatsQueryKeys.getStats() }),
        queryClient.invalidateQueries({
          queryKey: CollectionQueryKeys.getManyAll(),
        }),
        // TODO: add playthorugh and completion key as well and archived getmany key as well
      ]);
    },
  });
