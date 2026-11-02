import { isAxiosError } from "axios";
import { steamClient } from "./index";

import type {
  GetGlobalAchievementPercentagesForAppType,
  GetPlayerAchievementsType,
  GetSchemaForGameType,
} from "@repo/schemas/types/steam";

// Statuses where Steam is telling us "no data for you", not "Steam is broken".
const EXPECTED_STATUSES = new Set([400, 401, 403, 404, 429]);

function isExpectedSteamError(err: unknown): boolean {
  return (
    isAxiosError(err) &&
    err.response?.status !== undefined &&
    EXPECTED_STATUSES.has(err.response.status)
  );
}

/** Achievement definitions (name, icon, description, hidden). */
export async function fetchGameSchema(appId: string) {
  try {
    const res = await steamClient.get<GetSchemaForGameType>(
      "/ISteamUserStats/GetSchemaForGame/v2/",
      { params: { key: process.env.STEAM_TOKEN, appid: appId, l: "english" } },
    );

    return res.data.game?.availableGameStats?.achievements ?? [];
  } catch (err) {
    if (isExpectedSteamError(err)) return [];
    throw err;
  }
}

export type PlayerProgress = { achieved: boolean; unlockTime: Date | null };

/**
 * The player's unlock state, keyed by achievement apiname.
 * Returns null when the data is unavailable (private profile, no stats, etc).
 */
export async function fetchPlayerProgress(
  appId: string,
  steamId: string,
): Promise<Map<string, PlayerProgress> | null> {
  try {
    const res = await steamClient.get<GetPlayerAchievementsType>(
      "/ISteamUserStats/GetPlayerAchievements/v0001/",
      {
        params: {
          key: process.env.STEAM_TOKEN,
          appid: appId,
          steamid: steamId,
          l: "english",
        },
      },
    );

    const stats = res.data.playerstats;
    if (!stats?.success || !stats.achievements) return null;

    return new Map(
      stats.achievements.map((a) => [
        a.apiname,
        {
          achieved: a.achieved === 1,
          unlockTime: a.unlocktime ? new Date(a.unlocktime * 1000) : null,
        },
      ]),
    );
  } catch (err) {
    if (isExpectedSteamError(err)) return null;
    throw err;
  }
}

/** Global unlock percentage, keyed by achievement name. Public endpoint. */
export async function fetchGlobalPercentages(
  appId: string,
): Promise<Map<string, number>> {
  try {
    const res =
      await steamClient.get<GetGlobalAchievementPercentagesForAppType>(
        "/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/",
        { params: { gameid: appId, format: "json" } },
      );

    return new Map(
      (res.data.achievementpercentages?.achievements ?? []).map((a) => [
        a.name,
        Number(a.percent),
      ]),
    );
  } catch (err) {
    if (isExpectedSteamError(err)) return new Map();
    throw err;
  }
}
