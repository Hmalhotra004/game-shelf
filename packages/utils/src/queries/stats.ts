import { getStats } from "@repo/schemas/types/stats";
import { api } from "@repo/utils/lib/api";
import { queryOptions } from "@tanstack/react-query";

// Keys
export const StatsQueryKeys = {
  getStats: () => ["HomeStats"] as const,
};

// Queries
export const getStatsQueryOptions = () =>
  queryOptions({
    queryKey: StatsQueryKeys.getStats(),
    queryFn: async () => {
      const response = await api.get<getStats>(`/stats/getStats`);

      return response.data;
    },
  });
