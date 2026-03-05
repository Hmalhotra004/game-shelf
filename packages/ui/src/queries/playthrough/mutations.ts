import { CreatePlaythroughSchemaType } from "@repo/schemas/schemas/playthrough";
import { api } from "@repo/ui/lib/api";
import { showError } from "@repo/ui/lib/utils";
import { mutationOptions, QueryClient } from "@tanstack/react-query";
import { CollectionQueryKeys } from "../collection/collection.keys";
import { playthroughKeys } from "./keys";

type DeletePlaythroughSessionInput = {
  playthroughId: string;
  playthroughSessionId: string;
};

type DeletePlaythroughInput = {
  playthroughId: string;
};

export const startPlaythroughMutationOptions = (
  queryClient: QueryClient,
  onSuccess?: () => void,
) =>
  mutationOptions({
    mutationFn: async ({
      gameType,
      collectionId,
      dlcId,
    }: CreatePlaythroughSchemaType) => {
      await api.post("/playthrough/add", {
        gameType,
        collectionId,
        dlcId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: playthroughKeys.getMany(),
      });
      await queryClient.invalidateQueries({
        queryKey: CollectionQueryKeys.getMany(),
      });
      onSuccess?.();
    },
    onError: (err) => showError(err),
  });

export const deletePlaythroughMutationOptions = (
  queryClient: QueryClient,
  onSuccess?: () => void,
) =>
  mutationOptions({
    mutationFn: async ({ playthroughId }: DeletePlaythroughInput) => {
      await api.delete(`/playthrough/${playthroughId}/delete`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: playthroughKeys.getMany(),
      });
      onSuccess?.();
    },
    onError: (err) => showError(err),
  });

export const deletePlaythroughSessionMutationOptions = (
  queryClient: QueryClient,
  onSuccess?: () => void,
) =>
  mutationOptions({
    mutationFn: async ({
      playthroughId,
      playthroughSessionId,
    }: DeletePlaythroughSessionInput) => {
      await api.delete(
        `/playthrough/${playthroughId}/${playthroughSessionId}/delete`,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: playthroughKeys.getMany(),
      });
      onSuccess?.();
    },
    onError: (err) => showError(err),
  });
