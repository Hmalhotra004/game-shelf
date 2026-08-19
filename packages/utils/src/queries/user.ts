import { GetGamesType } from "@repo/schemas/types/user";
import { queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

export const UserQueryKeys = {
  all: ["User"] as const,

  getCollection: () => [...UserQueryKeys.all, "getCollection"] as const,
};

export const userGetCollectionQueryOptions = (
  api: AxiosInstance,
  enabled: boolean,
) =>
  queryOptions({
    queryKey: UserQueryKeys.getCollection(),
    queryFn: async () => {
      const response = await api.get<GetGamesType>(`/user/getGames`);

      return response.data;
    },
    enabled,
  });
