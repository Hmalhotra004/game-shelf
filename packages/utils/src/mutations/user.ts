import { PSNQueryKeys } from "@repo/utils/queries/psn";
import { SteamQueryKeys } from "@repo/utils/queries/steam";
import { mutationOptions, QueryClient } from "@tanstack/react-query";
import { AxiosInstance, isAxiosError } from "axios";
import { toast } from "sonner";

import {
  LinkSteamAccountSchemaType,
  UnlinkAccountSchemaType,
} from "@repo/schemas/schemas/user";

export const linkSteamAccountMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
) =>
  mutationOptions({
    mutationFn: async (data: LinkSteamAccountSchemaType) => {
      await api.patch("/user/linkSteamAccount", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: SteamQueryKeys.getProfile(),
      });
      queryClient.removeQueries({
        queryKey: SteamQueryKeys.getProfile(),
      });
      toast.success("Account Linked");
    },
    onError: (e) => {
      if (isAxiosError(e)) {
        toast.error(e.response?.data.error);
      }
    },
  });

export const unlinkAccountMutationOptions = (
  api: AxiosInstance,
  queryClient: QueryClient,
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
      queryClient.removeQueries({
        queryKey: SteamQueryKeys.getProfile(),
      });
      queryClient.removeQueries({
        queryKey: PSNQueryKeys.getProfile(),
      });
      toast.success("unlinked success");
    },
    onError: (e) => {
      if (isAxiosError(e)) {
        toast.error(e.response?.data.error);
      }
    },
  });
