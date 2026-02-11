export type getStats = {
  overview: {
    totalGames: number;
    totalDLCs: number;
    totalPlaytimeHours: number;
    totalSpent: number;
    activePlaythroughs: number;
    completedGames: number;
  };

  statusDistribution: {
    label: string;
    value: string;
  };

  platformDistribution: {
    label: string;
    value: string;
  };

  providerDistribution: {
    label: string;
    value: string;
  };

  completionStyleDistribution: {
    label: string;
    value: string;
  }[];

  playtimeByDate: {
    date: string;
    hours: string;
  }[];

  purchasesByMonth: {
    month: string;
    games: string;
    amount: string;
  }[];
};
