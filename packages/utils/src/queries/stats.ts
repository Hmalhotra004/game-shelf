import { getStats } from "@repo/schemas/types/stats";
import { queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

// Keys
export const StatsQueryKeys = {
  getStats: () => ["HomeStats"] as const,
};

// Queries
export const getStatsQueryOptions = (api: AxiosInstance) =>
  queryOptions({
    queryKey: StatsQueryKeys.getStats(),
    queryFn: async () => {
      const response = await api.get<getStats>(`/stats/getStats`);

      return response.data;
    },
  });
