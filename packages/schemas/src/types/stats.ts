import { DataType } from "./index";

export type getOverViewStatResponse = {
  totalGames: number;
  totalDLCs: number;
  totalPlaytimeHours: number;
  totalSpent: number;
  activePlaythroughs: number;
  completedGames: number;
};

export type WeeklyPlaytimeResponse = {
  weekStart: string;
  weekEnd: string;
  totalSeconds: number;
  activeDays: number;
  previousWeekTotalSeconds: number;
  days: {
    date: string;
    seconds: number;
    sessions: number;
  }[];
  streak: {
    current: number;
    playedToday: boolean;
  };
};

export type getStats = {
  overview: {
    totalGames: number;
    totalDLCs: number;
    totalPlaytimeHours: number;
    totalSpent: number;
    activePlaythroughs: number;
    completedGames: number;
  };

  statusDistribution: DataType[];

  platformDistribution: DataType[];

  providerDistribution: DataType[];

  completionStyleDistribution: DataType[];

  playtimeByDate: DataType[];

  purchasesByMonth: DataType[];
};
