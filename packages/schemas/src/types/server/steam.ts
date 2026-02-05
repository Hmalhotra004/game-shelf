export type GetOwnedGamesSteamType = {
  response: {
    game_count: number;
    games: {
      appid: number;
      img_icon_url: string;
      name: string;
      playtime_forever: number;
    }[];
  };
};
