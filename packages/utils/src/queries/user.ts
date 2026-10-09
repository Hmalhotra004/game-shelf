import { GetGamesType } from "@repo/schemas/types/user";
import { queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

export const UserQueryKeys = {
  all: ["User"] as const,

  getCollection: (search?: string) =>
    [...UserQueryKeys.all, "getCollection", search] as const,
};

export const userGetCollectionQueryOptions = (
  api: AxiosInstance,
  enabled: boolean,
  search?: string,
) =>
  queryOptions({
    queryKey: UserQueryKeys.getCollection(search),
    queryFn: async () => {
      const response = await api.get<GetGamesType>(`/user/getGames`, {
        params: { query: search },
      });

      return response.data;
    },
    enabled,
  });
