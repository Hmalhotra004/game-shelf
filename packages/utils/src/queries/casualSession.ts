import { infiniteQueryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

import {
  CasualSessionGetManyFilters,
  CasualSessionGetManyResponse,
} from "@repo/schemas/types/casualSession";

export const CasualSessionQueryKeys = {
  all: ["CasualSession"] as const,

  getManyAll: () => [...CasualSessionQueryKeys.all, "getMany"] as const,

  getMany: (filters: CasualSessionGetManyFilters) =>
    [...CasualSessionQueryKeys.all, "getMany", filters] as const,
};

const DEFAULT_LIMIT = 20;
export const collectionGetManyCasualSessionsQueryOptions = (
  api: AxiosInstance,
  filters: CasualSessionGetManyFilters,
) =>
  infiniteQueryOptions({
    queryKey: CasualSessionQueryKeys.getMany(filters),

    queryFn: async ({ pageParam, signal }) => {
      const { limit = DEFAULT_LIMIT, ...rest } = filters;

      const response = await api.query<CasualSessionGetManyResponse>(
        `/casualSession`,
        { ...rest, page: pageParam, limit },
        { signal },
      );

      return response.data;
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });
