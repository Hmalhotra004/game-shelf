import { DataType } from "./index";

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
