import { infiniteQueryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

import {
  CompletionGetManyFilters,
  CompletionGetManyResponse,
} from "@repo/schemas/types/completion";

export const CompletionQueryKeys = {
  all: ["Completion"] as const,

  getManyAll: () => [...CompletionQueryKeys.all, "getMany"] as const,

  getMany: (filters: CompletionGetManyFilters = {}) =>
    [CompletionQueryKeys.all, "getMany", filters] as const,
};

const DEFAULT_LIMIT = 20;
export const completionGetManyQueryOptions = (
  api: AxiosInstance,
  filters: CompletionGetManyFilters = {},
) =>
  infiniteQueryOptions({
    queryKey: CompletionQueryKeys.getMany(filters),

    queryFn: async ({ pageParam, signal }) => {
      const { limit = DEFAULT_LIMIT, ...rest } = filters;

      const response = await api.query<CompletionGetManyResponse>(
        `/completion`,
        { ...rest, page: pageParam, limit },
        { signal },
      );

      return response.data;
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });
