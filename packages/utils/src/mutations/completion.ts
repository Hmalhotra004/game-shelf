import { CreateCompletionSchemaType } from "@repo/schemas/schemas/completion";
import { CollectionQueryKeys } from "@repo/utils/queries/collection";
import { CompletionQueryKeys } from "@repo/utils/queries/completion";
import { StatsQueryKeys } from "@repo/utils/queries/stats";
import { mutationOptions, QueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

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
      onSuccess?.();
    },
    onError: (err) => onError(err),
  });
