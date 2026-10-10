import { infiniteQueryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

import {
  PlaythroughGetManyFilters,
  PlaythroughGetManyResponse,
} from "@repo/schemas/types/playthrough";

export const PlaythroughQueryKeys = {
  all: ["Playthrough"] as const,

  getManyAll: () => ["Playthrough", "getMany"] as const,

  getMany: (filters: PlaythroughGetManyFilters = {}) =>
    ["Playthrough", "getMany", filters] as const,
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
