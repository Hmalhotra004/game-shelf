export type steamRarityType = "Common" | "Uncommon" | "Rare" | "Ultra Rare";

export type SteamSearchResultType = {
  total: number;
  items: SteamSearchGameType[];
};

export type SteamSearchGameType = {
  id: number;
  name: string;
  tiny_image: string;
};

export type SteamAppDetailsType = {
  number: {
    data: {
      steam_appid: number;
      name: string;
      short_description?: string;
      detailed_description?: string;
      header_image?: string;
      capsule_image?: string;
      release_date?: { coming: boolean; date: string };
      achievements?: {
        highlighted: { name: string; path: string }[];
        total: number;
      };
    };
    success: boolean;
  };
};

export type GetPlayerAchievementsType = {
  playerstats: {
    gameName: string;
    steamID: string;
    success: boolean;
    achievements: {
      achieved: 1 | 0;
      apiname: string;
      description: string;
      name: string;
      unlocktime: number;
    }[];
  };
};

export type GetSchemaForGameType = {
  game: {
    availableGameStats: {
      achievements: {
        name: string;
        displayName: string;
        description: string;
        icon: string;
        icongray: string;
        defaultvalue: number;
        hidden: 1 | 0;
      }[];
      stats: [];
    };
    gameName: string;
    gameVersion: string;
  };
};

export type GetGlobalAchievementPercentagesForAppType = {
  achievementpercentages: {
    achievements: {
      name: string;
      percent: string;
    }[];
  };
};

export type getSteamProfileType = {
  response: {
    players: {
      avatarfull: string;
      personaname: string;
      profileurl: string;
      realname: string;
    }[];
  };
};
