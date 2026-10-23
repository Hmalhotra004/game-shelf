import { CompletionGetManyResponse } from "@repo/schemas/types/completion";
import { CollectionQueryKeys } from "@repo/utils/queries/collection";
import { CompletionQueryKeys } from "@repo/utils/queries/completion";
import { PlaythroughQueryKeys } from "@repo/utils/queries/playthrough";
import { StatsQueryKeys } from "@repo/utils/queries/stats";
import { UserQueryKeys } from "@repo/utils/queries/user";
import { AxiosInstance } from "axios";

import {
  CreateCompletionSchemaType,
  UpdateCompletionSchemaType,
} from "@repo/schemas/schemas/completion";

import {
  InfiniteData,
  mutationOptions,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";

// --------------------- Types ------------------------------------
type CompletionInfinite = InfiniteData<CompletionGetManyResponse>;

type DeleteContext = {
  previous: [QueryKey, CompletionInfinite | undefined][];
};

// -------------------- Mutations --------------------------

export const addCompletionMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions({
    mutationFn: async (data: CreateCompletionSchemaType) => {
      await api.post("/completion", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: StatsQueryKeys.getStats(),
      });
      await queryClient.invalidateQueries({
        queryKey: CollectionQueryKeys.getManyAll(),
      });
      await queryClient.invalidateQueries({
        queryKey: CompletionQueryKeys.getManyAll(),
      });
      await queryClient.invalidateQueries({
        queryKey: PlaythroughQueryKeys.getManyAll(),
      });
      onSuccess?.();
    },
    onError: (err) => onError(err),
  });

export const updateCompletionMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  completionId: string,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions({
    mutationFn: async (data: UpdateCompletionSchemaType) => {
      await api.patch(`/completion/${completionId}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: StatsQueryKeys.getStats(),
      });
      await queryClient.invalidateQueries({
        queryKey: CompletionQueryKeys.getManyAll(),
      });
      await queryClient.invalidateQueries({
        queryKey: CollectionQueryKeys.getManyAll(),
      });
      onSuccess?.();
    },
    onError: (err) => onError(err),
  });

export const deleteCompletionMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions<void, Error, string, DeleteContext>({
    mutationFn: async (id: string) => {
      await api.delete(`/completion/${id}`);
    },

    onMutate: async (id) => {
      const key = CompletionQueryKeys.getManyAll();

      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueriesData<CompletionInfinite>({
        queryKey: key,
      });

      queryClient.setQueriesData<CompletionInfinite>(
        { queryKey: key },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => {
              const removedItems = page.items.filter((item) => item.id === id);
              const items = page.items.filter((item) => item.id !== id);

              const removedPlaytime = removedItems.reduce(
                (sum, item) => sum + (item.totalPlaytime ?? 0),
                0,
              );

              return {
                ...page,
                items,
                total: Math.max(0, page.total - removedItems.length),
                totalPlaytime: Math.max(
                  0,
                  page.totalPlaytime - removedPlaytime,
                ),
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
          queryKey: CompletionQueryKeys.getManyAll(),
        }),
        queryClient.invalidateQueries({
          queryKey: CollectionQueryKeys.getManyAll(),
        }),
        queryClient.invalidateQueries({
          queryKey: UserQueryKeys.getCollection(),
        }),
      ]);
    },
  });
