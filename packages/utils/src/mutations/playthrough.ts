import { PlaythroughGetManyResponse } from "@repo/schemas/types/playthrough";
import { CollectionQueryKeys } from "@repo/utils/queries/collection";
import { PlaythroughQueryKeys } from "@repo/utils/queries/playthrough";
import { StatsQueryKeys } from "@repo/utils/queries/stats";
import { AxiosInstance } from "axios";

import {
  CreatePlaythroughSchemaType,
  CreatePlaythroughSessionSchemaType,
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

type DeleteSessionVariables = {
  id: string;
  sessionId: string;
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
      await api.patch(`/playthrough/${id}`, { status, notes });
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

export const addPlaythroughSessionMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions({
    mutationFn: async ({
      id,
      ...data
    }: { id: string } & CreatePlaythroughSessionSchemaType) => {
      await api.post(`/playthrough/${id}`, data);
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

export const deletePlaythroughSessionMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions<void, Error, DeleteSessionVariables, DeleteContext>({
    mutationFn: async ({ id, sessionId }) => {
      await api.delete(`/playthrough/${id}/${sessionId}`);
    },

    onMutate: async ({ id, sessionId }) => {
      const key = PlaythroughQueryKeys.getManyAll();

      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueriesData<PlaythroughInfinite>({
        queryKey: key,
      });

      queryClient.setQueriesData<PlaythroughInfinite>(
        { queryKey: key },
        (old) => {
          if (!old) return old;

          // seconds of the session being deleted (0 if this cache entry doesn't hold it)
          const removedSeconds =
            old.pages
              .flatMap((page) => page.items)
              .find((item) => item.id === id)
              ?.sessions.find((s) => s.id === sessionId)?.duration ?? 0;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              // overall playtime for the current filters, repeated on every page
              totalSeconds: Math.max(0, page.totalSeconds - removedSeconds),
              items: page.items.map((item) =>
                item.id !== id
                  ? item
                  : {
                      ...item,
                      totalSeconds: Math.max(
                        0,
                        item.totalSeconds - removedSeconds,
                      ),
                      sessions: item.sessions.filter((s) => s.id !== sessionId),
                    },
              ),
            })),
          };
        },
      );

      return { previous };
    },

    onError: (err, _variables, context) => {
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
        queryClient.invalidateQueries({
          queryKey: StatsQueryKeys.getStats(),
        }),
        queryClient.invalidateQueries({
          queryKey: CollectionQueryKeys.getManyAll(),
        }),
        queryClient.invalidateQueries({
          queryKey: PlaythroughQueryKeys.getManyAll(),
        }),
      ]);
    },
  });
