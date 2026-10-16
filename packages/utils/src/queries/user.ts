import { GameBasicInfoQuerySchemaType } from "@repo/schemas/schemas/user";
import { GameType } from "@repo/schemas/types/index";
import { GetGameBasicInfoType, GetGamesType } from "@repo/schemas/types/user";
import { queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

export const UserQueryKeys = {
  all: ["User"] as const,

  getCollection: (search?: string) =>
    [...UserQueryKeys.all, "getCollection", search] as const,

  getGameInfo: (id: string, gameType: GameType) =>
    [...UserQueryKeys.all, "getGameInfo", id, gameType] as const,
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

export const getGameBasicInfo = (
  api: AxiosInstance,
  enabled: boolean,
  id: string,
  gameType: GameType,
) =>
  queryOptions({
    queryKey: UserQueryKeys.getGameInfo(id, gameType),
    queryFn: async () => {
      const response = await api.get<GetGameBasicInfoType>(
        `/user/getGameBasicInfo`,
        {
          params: { id, gameType } as GameBasicInfoQuerySchemaType,
        },
      );

      return response.data;
    },
    enabled,
  });
