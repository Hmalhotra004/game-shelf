import { CollectionStatusType, ProviderType } from "@repo/schemas/types/index";
import { GetOwnedGamesSteamType } from "@repo/schemas/types/steam";
import axios from "axios";
import { Logger } from "pino";

export const getSteamPlaytimeByAppId = async (
  steamId: string | null | undefined,
  log: Logger,
): Promise<Record<number, number>> => {
  if (!steamId) return {};

  try {
    const response = await axios.get<GetOwnedGamesSteamType>(
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/",
      {
        params: {
          key: process.env.STEAM_TOKEN,
          steamid: steamId,
          format: "json",
          include_appinfo: false,
        },
        timeout: 5000,
      },
    );

    const steamGames = response.data.response.games ?? [];

    // minutes -> seconds
    return Object.fromEntries(
      steamGames.map((g) => [g.appid, g.playtime_forever * 60]),
    );
  } catch (err) {
    log.warn({ err }, "STEAM_PLAYTIME_FETCH_FAILED");
    return {};
  }
};

/** True when a game's online playtime should come from Steam. */
export const needsSteamPlaytime = (g: {
  provider: ProviderType;
  status: CollectionStatusType;
  steamAppId?: string | number | null;
}): Boolean =>
  g.provider === "Steam" && g.status === "Online" && !!g.steamAppId;

/** Online playtime in seconds for one game, given the map from above. */
export const getOnlineSteamPlaySecs = (
  g: Parameters<typeof needsSteamPlaytime>[0],
  playtimeByAppId: Record<number, number>,
) => (needsSteamPlaytime(g) ? (playtimeByAppId[Number(g.steamAppId)] ?? 0) : 0);
