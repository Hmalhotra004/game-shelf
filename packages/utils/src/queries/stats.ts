import { WeekStatsQueryType } from "@repo/schemas/schemas/stats";
import { queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

import {
  getOverViewStatResponse,
  WeeklyPlaytimeResponse,
} from "@repo/schemas/types/stats";

// Keys
export const StatsQueryKeys = {
  all: () => ["Stats"] as const,

  homeStats: () => [...StatsQueryKeys.all(), "homeStats"] as const,

  getOverview: () => [...StatsQueryKeys.homeStats(), "getOverview"] as const,

  getWeeklyPlaytime: (params: WeekStatsQueryType) =>
    [...StatsQueryKeys.homeStats(), "getWeeklyPlaytime", params] as const,
};

export const getOverviewStatsQueryOptions = (api: AxiosInstance) =>
  queryOptions({
    queryKey: StatsQueryKeys.getOverview(),
    queryFn: async () => {
      const response =
        await api.get<getOverViewStatResponse>(`/stats/getOverview`);

      return response.data;
    },
  });

export const getWeeklyPlaytimeStatsQueryOptions = (
  api: AxiosInstance,
  params: WeekStatsQueryType,
) =>
  queryOptions({
    queryKey: StatsQueryKeys.getWeeklyPlaytime(params),
    queryFn: async ({ signal }) => {
      const response = await api.get<WeeklyPlaytimeResponse>(
        `/stats/getWeeklyPlaytime`,
        { params, signal },
      );
      return response.data;
    },
  });
