import { queryOptions } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { StatsQueryKeys } from "./stats.keys";

import { getStats } from "@repo/schemas/types/stats";

export const getStatsQueryOptions = () =>
  queryOptions({
    queryKey: StatsQueryKeys.getStats(),
    queryFn: async () => {
      const response = await api.get<getStats>(`/stats/getStats`);

      return response.data;
    },
  });
