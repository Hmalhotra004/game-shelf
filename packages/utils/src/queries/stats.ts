import { queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

import {
  PickNextQuerySchemaType,
  WeekStatsQueryType,
} from "@repo/schemas/schemas/stats";

import {
  getOverViewStatResponse,
  HomeActivityResponse,
  HomeOnHoldResponse,
  HomePickNextResponse,
  WeeklyPlaytimeResponse,
} from "@repo/schemas/types/homeStats";

// Keys
export const StatsQueryKeys = {
  all: () => ["Stats"] as const,

  homeStats: () => [...StatsQueryKeys.all(), "homeStats"] as const,

  getOverview: () => [...StatsQueryKeys.homeStats(), "getOverview"] as const,

  homeActivity: () => [...StatsQueryKeys.homeStats(), "Activity"] as const,

  getWeeklyPlaytime: (params: WeekStatsQueryType) =>
    [...StatsQueryKeys.homeStats(), "getWeeklyPlaytime", params] as const,

  homeOnHold: () => [...StatsQueryKeys.homeStats(), "OnHold"] as const,

  homePickNextAll: () => [...StatsQueryKeys.homeStats(), "PickNext"] as const,
  homePickNext: (exclude?: string) =>
    [...StatsQueryKeys.homeStats(), "PickNext", exclude ?? null] as const,
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

export const getPickNextQueryOptions = (api: AxiosInstance, exclude?: string) =>
  queryOptions({
    queryKey: StatsQueryKeys.homePickNext(exclude),
    queryFn: async ({ signal }) => {
      const response = await api.get<HomePickNextResponse>(
        `/stats/getPickNext`,
        {
          params: { exclude } as PickNextQuerySchemaType,
          signal,
        },
      );

      return response.data;
    },
  });

export const getHomeActivityQueryOptions = (api: AxiosInstance) =>
  queryOptions({
    queryKey: StatsQueryKeys.homeActivity(),
    queryFn: async ({ signal }) => {
      const response = await api.get<HomeActivityResponse>(
        `/stats/getHomeActivity`,
        { signal },
      );

      return response.data;
    },
  });

export const getHomeOnHoldQueryOptions = (api: AxiosInstance) =>
  queryOptions({
    queryKey: StatsQueryKeys.homeOnHold(),
    queryFn: async ({ signal }) => {
      const response = await api.get<HomeOnHoldResponse>(
        `/stats/getHomeOnHold`,
        { signal },
      );

      return response.data;
    },
  });
