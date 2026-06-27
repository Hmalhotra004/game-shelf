import { AccountProfileType } from "@repo/schemas/types/user";
import { queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

export const SteamQueryKeys = {
  all: ["Steam"] as const,

  getProfile: () => [...SteamQueryKeys.all, "getProfile"] as const,
};

export const getSteamProfileQueryOptions = (
  api: AxiosInstance,
  enabled: boolean,
) =>
  queryOptions({
    queryKey: SteamQueryKeys.getProfile(),
    queryFn: async () => {
      const response = await api.get<AccountProfileType>(`/steam/getProfile`);

      return response.data;
    },
    enabled,
  });
