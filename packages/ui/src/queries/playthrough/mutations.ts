import { CreatePlaythroughSchemaType } from "@repo/schemas/schemas/playthrough";
import { api } from "@repo/ui/lib/api";
import { showError } from "@repo/ui/lib/utils";
import { mutationOptions, QueryClient } from "@tanstack/react-query";
import { CollectionQueryKeys } from "../collection/collection.keys";
import { playthroughKeys } from "./keys";

export const startPlaythroughMutationOptions = (
  queryClient: QueryClient,
  onSuccess?: () => void,
) =>
  mutationOptions({
    mutationFn: async (data: CreatePlaythroughSchemaType) => {
      await api.post("/playthrough/add", {
        gameType: data.gameType,
        collectionId: data.collectionId,
        dlcId: data.dlcId,
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
