import { CreateCollectionSchemaType } from "@repo/schemas/schemas/collection";
import { CollectionQueryKeys } from "@repo/utils/queries/collection";
import { StatsQueryKeys } from "@repo/utils/queries/stats";
import { mutationOptions, QueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

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
