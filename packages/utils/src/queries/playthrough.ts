import { GetByIdPlayQuerySchemaType } from "@repo/schemas/schemas/playthrough";
import { GameType } from "@repo/schemas/types/index";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

import {
  PlaythroughGetByIdResponseType,
  PlaythroughGetManyFilters,
  PlaythroughGetManyResponse,
} from "@repo/schemas/types/playthrough";

export const PlaythroughQueryKeys = {
  all: ["Playthrough"] as const,

  getManyAll: () => [...PlaythroughQueryKeys.all, "getMany"] as const,

  getMany: (filters: PlaythroughGetManyFilters = {}) =>
    [...PlaythroughQueryKeys.all, "getMany", filters] as const,

  getById: (id: string, gameType: GameType) =>
    [...PlaythroughQueryKeys.all, "getById", id, gameType] as const,
};

const DEFAULT_LIMIT = 20;
export const PlaythroughGetManyQueryOptions = (
  api: AxiosInstance,
  filters: PlaythroughGetManyFilters = {},
) =>
  infiniteQueryOptions({
    queryKey: PlaythroughQueryKeys.getMany(filters),

    queryFn: async ({ pageParam, signal }) => {
      const { limit = DEFAULT_LIMIT, ...rest } = filters;

      const response = await api.query<PlaythroughGetManyResponse>(
        `/playthrough`,
        { ...rest, page: pageParam, limit },
        { signal },
      );

      return response.data;
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });

export const getByIdPlayQueryOptions = (
  api: AxiosInstance,
  enabled: boolean,
  id: string,
  gameType: GameType,
) =>
  queryOptions({
    queryKey: PlaythroughQueryKeys.getById(id, gameType),
    queryFn: async () => {
      const response = await api.get<PlaythroughGetByIdResponseType>(
        `/playthrough/${id}`,
        {
          params: { gameType } as GetByIdPlayQuerySchemaType,
        },
      );

      return response.data;
    },
    enabled,
  });
