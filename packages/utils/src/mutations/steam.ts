import { LinkSteamAccountSchemaType } from "@repo/schemas/schemas/steam";
import { SteamQueryKeys } from "@repo/utils/queries/steam";
import { mutationOptions, QueryClient } from "@tanstack/react-query";
import { AxiosInstance, isAxiosError } from "axios";
import { toast } from "sonner";

export const linkSteamAccountMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
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
      toast.success("Account Linked");
      onSuccess?.();
    },
    onError: (e) => {
      if (isAxiosError(e)) {
        toast.error(e.response?.data.error);
      }
    },
  });
