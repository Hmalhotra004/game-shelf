import type { CasualSessionGetManyResponse } from "@repo/schemas/types/casualSession";
import { CasualSessionQueryKeys } from "@repo/utils/queries/casualSession";
import { CollectionQueryKeys } from "@repo/utils/queries/collection";
import { StatsQueryKeys } from "@repo/utils/queries/stats";
import { AxiosInstance } from "axios";

import {
  CreateCasualSessionSchemaType,
  UpdateCasualSessionSchemaType,
} from "@repo/schemas/schemas/casualSession";

import {
  InfiniteData,
  mutationOptions,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";

// --------------------- Types------------------------------------
type CasualSessionInfinite = InfiniteData<CasualSessionGetManyResponse>;

type MutationContext = {
  previous: [QueryKey, CasualSessionInfinite | undefined][];
};

type UpdateVariables = { id: string } & UpdateCasualSessionSchemaType;

// --------------------Helpers--------------------------
const invalidateAll = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: StatsQueryKeys.all() }),
    queryClient.invalidateQueries({
      queryKey: CasualSessionQueryKeys.getManyAll(),
    }),
    queryClient.invalidateQueries({
      queryKey: CollectionQueryKeys.getManyAll(),
    }),
  ]);

const rollback = (queryClient: QueryClient, context?: MutationContext) => {
  context?.previous.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
};

// --------------------Mutations--------------------------

export const addCasualSessionMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions({
    mutationFn: async (data: CreateCasualSessionSchemaType) => {
      await api.post("/casualSession", data);
    },
    onSuccess: async () => {
      await invalidateAll(queryClient);
      onSuccess?.();
    },
    onError: (err) => onError(err),
  });

export const updateCasualSessionMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions<void, Error, UpdateVariables, MutationContext>({
    mutationFn: async ({ id, ...data }) => {
      await api.patch(`/casualSession/${id}`, data);
    },

    onMutate: async ({ id, ...data }) => {
      const key = CasualSessionQueryKeys.getManyAll();

      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueriesData<CasualSessionInfinite>({
        queryKey: key,
      });

      queryClient.setQueriesData<CasualSessionInfinite>(
        { queryKey: key },
        (old) => {
          if (!old) return old;

          const oldSeconds = old.pages
            .flatMap((page) => page.items)
            .find((item) => item.id === id)?.secondsPlayed;

          // this cache entry doesn't hold the session
          if (oldSeconds === undefined) return old;

          const diff = (data.secondsPlayed ?? oldSeconds) - oldSeconds;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              // overall playtime for the current filters, repeated on every page
              totalSeconds: Math.max(0, page.totalSeconds + diff),
              items: page.items.map((item) =>
                item.id === id ? { ...item, ...data } : item,
              ),
            })),
          };
        },
      );

      return { previous };
    },

    onError: (err, _vars, context) => {
      rollback(queryClient, context);
      onError(err);
    },

    onSuccess: () => {
      onSuccess?.();
    },

    onSettled: async () => {
      await invalidateAll(queryClient);
    },
  });

export const deleteCasualSessionMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions<void, Error, string, MutationContext>({
    mutationFn: async (id: string) => {
      await api.delete(`/casualSession/${id}`);
    },

    onMutate: async (id) => {
      const key = CasualSessionQueryKeys.getManyAll();

      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueriesData<CasualSessionInfinite>({
        queryKey: key,
      });

      queryClient.setQueriesData<CasualSessionInfinite>(
        { queryKey: key },
        (old) => {
          if (!old) return old;

          // seconds of the session being deleted (0 if this cache entry doesn't hold it)
          const removedSeconds =
            old.pages
              .flatMap((page) => page.items)
              .find((item) => item.id === id)?.secondsPlayed ?? 0;

          return {
            ...old,
            pages: old.pages.map((page) => {
              const items = page.items.filter((item) => item.id !== id);
              const removed = page.items.length - items.length;

              return {
                ...page,
                items,
                total: Math.max(0, page.total - removed),
                totalSeconds: Math.max(0, page.totalSeconds - removedSeconds),
              };
            }),
          };
        },
      );

      return { previous };
    },

    onError: (err, _id, context) => {
      rollback(queryClient, context);
      onError(err);
    },

    onSuccess: () => {
      onSuccess?.();
    },

    onSettled: async () => {
      await invalidateAll(queryClient);
    },
  });
