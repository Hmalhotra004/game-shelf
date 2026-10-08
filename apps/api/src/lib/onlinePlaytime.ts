import { redis } from "@/lib/redis";
import { CollectionStatusType, ProviderType } from "@repo/schemas/types/index";
import { GetOwnedGamesSteamType } from "@repo/schemas/types/steam";
import axios from "axios";
import { Logger } from "pino";

const CACHE_TTL_SECONDS = 60 * 60; // 1 hour
const cacheKey = (steamId: string) => `steam:playtime:${steamId}`;

type PlaytimeMap = Record<number, number>;

const fetchFromSteam = async (
  steamId: string,
  log: Logger,
): Promise<PlaytimeMap | null> => {
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
    return null; // null = failed, so we never cache a failure
  }
};

export const getSteamPlaytimeByAppId = async (
  steamId: string | null | undefined,
  log: Logger,
): Promise<PlaytimeMap> => {
  if (!steamId) return {};

  // 1. try cache (Redis problems must never break the request)
  try {
    const cached = await redis.get(cacheKey(steamId));
    if (cached) return JSON.parse(cached) as PlaytimeMap;
  } catch (err) {
    log.warn({ err }, "STEAM_PLAYTIME_CACHE_READ_FAILED");
  }

  // 2. miss -> hit Steam
  const fresh = await fetchFromSteam(steamId, log);
  if (!fresh) return {};

  // 3. store for an hour
  try {
    await redis.set(cacheKey(steamId), JSON.stringify(fresh), {
      expiration: { type: "EX", value: CACHE_TTL_SECONDS },
    });
  } catch (err) {
    log.warn({ err }, "STEAM_PLAYTIME_CACHE_WRITE_FAILED");
  }

  return fresh;
};

/** Call this if you ever want to force a refresh for a user. */
export const invalidateSteamPlaytimeCache = async (steamId: string) => {
  await redis.del(cacheKey(steamId));
};

/** True when a game's online playtime should come from Steam. */
export const needsSteamPlaytime = (g: {
  provider: ProviderType;
  status: CollectionStatusType;
  steamAppId?: string | number | null;
}): boolean =>
  g.provider === "Steam" && g.status === "Online" && !!g.steamAppId;

/** Online playtime in seconds for one game, given the map from above. */
export const getOnlineSteamPlaySecs = (
  g: Parameters<typeof needsSteamPlaytime>[0],
  playtimeByAppId: PlaytimeMap,
) => (needsSteamPlaytime(g) ? (playtimeByAppId[Number(g.steamAppId)] ?? 0) : 0);
