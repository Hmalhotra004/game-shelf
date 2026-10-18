import { UnlinkAccountSchemaType } from "@repo/schemas/schemas/user";
import { PSNQueryKeys } from "@repo/utils/queries/psn";
import { SteamQueryKeys } from "@repo/utils/queries/steam";
import { mutationOptions, QueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

export const unlinkAccountMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions({
    mutationFn: async (data: UnlinkAccountSchemaType) => {
      await api.patch("/user/unlinkAccount", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: PSNQueryKeys.getProfile(),
      });
      await queryClient.invalidateQueries({
        queryKey: SteamQueryKeys.getProfile(),
      });
      onSuccess?.();
    },
    onError: (e) => onError(e),
  });
