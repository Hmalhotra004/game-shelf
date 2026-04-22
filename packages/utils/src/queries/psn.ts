import { AccountProfileType } from "@repo/schemas/types/user";
import { queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

export const PSNQueryKeys = {
  all: ["PSN"] as const,

  getProfile: () => [...PSNQueryKeys.all, "getProfile"] as const,
};

export const getPSNProfileQueryOptions = (
  api: AxiosInstance,
  enabled: boolean,
) =>
  queryOptions({
    queryKey: PSNQueryKeys.getProfile(),
    queryFn: async () => {
      const response = await api.get<AccountProfileType>(`/PSN/getProfile`);

      return response.data;
    },
    enabled,
  });
