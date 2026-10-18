import { AccountProfileType } from "@repo/schemas/types/user";
import { queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

export const PSNQueryKeys = {
  all: ["PSN"] as const,

  getProfile: () => [...PSNQueryKeys.all, "getProfile"] as const,

  searchByUsername: (query: string) => [
    ...PSNQueryKeys.all,
    "searchByUsername",
    query,
  ],
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

export const searchPSNByUsernameQueryOptions = (
  api: AxiosInstance,
  enabled: boolean,
  query: string,
) =>
  queryOptions({
    queryKey: PSNQueryKeys.searchByUsername(query),
    queryFn: async () => {
      const response = await api.get<AccountProfileType>(
        `/PSN/searchByUsername`,
      );

      return response.data;
    },
    enabled,
  });
