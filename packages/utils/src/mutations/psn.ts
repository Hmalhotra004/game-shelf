import { LinkPSNAccountSchemaType } from "@repo/schemas/schemas/psn";
import { PSNQueryKeys } from "@repo/utils/queries/psn";
import { mutationOptions, QueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

export const linkPSNAccountMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions({
    mutationFn: async (data: LinkPSNAccountSchemaType) => {
      await api.patch("/PSN/link", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: PSNQueryKeys.getProfile(),
      });
      onSuccess?.();
    },
    onError: (e) => onError(e),
  });
