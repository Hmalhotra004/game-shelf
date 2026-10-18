import { LinkSteamAccountSchemaType } from "@repo/schemas/schemas/steam";
import { SteamQueryKeys } from "@repo/utils/queries/steam";
import { mutationOptions, QueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

export const linkSteamAccountMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
  onError: (error: Error) => void,
  onSuccess?: () => void,
) =>
  mutationOptions({
    mutationFn: async (data: LinkSteamAccountSchemaType) => {
      await api.patch("/steam/link", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: SteamQueryKeys.getProfile(),
      });
      onSuccess?.();
    },
    onError: (e) => onError(e),
  });
