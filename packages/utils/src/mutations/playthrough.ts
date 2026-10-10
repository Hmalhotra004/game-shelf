import { PlaythroughGetManyResponse } from "@repo/schemas/types/playthrough";
import { CollectionQueryKeys } from "@repo/utils/queries/collection";
import { PlaythroughQueryKeys } from "@repo/utils/queries/playthrough";
import { StatsQueryKeys } from "@repo/utils/queries/stats";
import { AxiosInstance } from "axios";

import {
  CreatePlaythroughSchemaType,
  UpdatePlaythroughSchemaType,
} from "@repo/schemas/schemas/playthrough";

import {
  InfiniteData,
  mutationOptions,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";

// --------------------- Types------------------------------------
type PlaythroughInfinite = InfiniteData<PlaythroughGetManyResponse>;

type StatusContext = {
  previous: [QueryKey, PlaythroughInfinite | undefined][];
};

type UpdateStatusVariables = {
  id: string;
  status: UpdatePlaythroughSchemaType["status"];
  notes: UpdatePlaythroughSchemaType["notes"];
};

type DeleteContext = {
  previous: [QueryKey, PlaythroughInfinite | undefined][];
};

// --------------------Mutations--------------------------

export const startPlaythroughMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions({
    mutationFn: async (data: CreatePlaythroughSchemaType) => {
      await api.post("/playthrough", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: StatsQueryKeys.getStats(),
      });
      await queryClient.invalidateQueries({
        queryKey: CollectionQueryKeys.getManyAll(),
      });
      await queryClient.invalidateQueries({
        queryKey: PlaythroughQueryKeys.getManyAll(),
      });
      onSuccess?.();
    },
    onError: (err) => onError(err),
  });

export const updatePlaythroughMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions<void, Error, UpdateStatusVariables, StatusContext>({
    mutationFn: async ({ id, status, notes }) => {
      await api.patch(`/playthrough/${id}/status`, { status, notes });
    },

    onMutate: async ({ id, status, notes }) => {
      const key = PlaythroughQueryKeys.getManyAll();

      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueriesData<PlaythroughInfinite>({
        queryKey: key,
      });

      queryClient.setQueriesData<PlaythroughInfinite>(
        { queryKey: key },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === id ? { ...item, status, notes } : item,
              ),
            })),
          };
        },
      );

      return { previous };
    },

    onError: (err, _vars, context) => {
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
        queryClient.invalidateQueries({
          queryKey: PlaythroughQueryKeys.getManyAll(),
        }),
      ]);
    },
  });

export const deletePlaythroughMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions<void, Error, string, DeleteContext>({
    mutationFn: async (id: string) => {
      await api.delete(`/playthrough/${id}`);
    },

    onMutate: async (id) => {
      const key = PlaythroughQueryKeys.getManyAll();

      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueriesData<PlaythroughInfinite>({
        queryKey: key,
      });

      queryClient.setQueriesData<PlaythroughInfinite>(
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
        queryClient.invalidateQueries({
          queryKey: PlaythroughQueryKeys.getManyAll(),
        }),
      ]);
    },
  });
