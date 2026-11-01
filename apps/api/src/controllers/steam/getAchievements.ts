import { GenericErrorMessage } from "@/constants";
import { steamRarity, trophyTypeMap } from "@/lib/trophyTypeMap";
import type { Request, Response } from "express";

import {
  fetchGameSchema,
  fetchGlobalPercentages,
  fetchPlayerProgress,
} from "@/lib/steam/achievements";

const EMPTY_RESULT = { total: 0, unlocked: 0, groups: [] };

export const getAchievements = async (req: Request, res: Response) => {
  try {
    const steamId = req.user.steamId;
    const steamAppId = req.collection.steamAppId;

    if (!steamAppId) {
      return res.status(400).json({ error: "Game has no Steam app ID" });
    }

    // Player progress is only fetched when a Steam account is linked.
    // Schema and global percentages are public, so they always load.
    const [schema, progress, globalPercent] = await Promise.all([
      fetchGameSchema(steamAppId),
      steamId ? fetchPlayerProgress(steamAppId, steamId) : null,
      fetchGlobalPercentages(steamAppId),
    ]);

    // The game itself has no achievements.
    if (schema.length === 0) {
      return res.status(200).json(EMPTY_RESULT);
    }

    // progress is null when no account is linked or the profile is private;
    // in that case every trophy is returned as locked with no unlock time.
    const trophies = schema.map((a) => {
      const earned = progress?.get(a.name);
      // Missing global % (new/obscure game) falls back to 100 => most common.
      const percent = globalPercent.get(a.name) ?? 100;

      return {
        id: a.name,
        name: a.displayName,
        description:
          a.description?.trim() || (a.hidden === 1 ? "Hidden achievement" : ""),
        icon: a.icon || null,
        iconGray: a.icongray || null,
        achieved: earned?.achieved ?? false,
        hidden: a.hidden === 1,
        rarity: steamRarity(percent),
        type: trophyTypeMap(percent),
        unlockTime: earned?.unlockTime ?? null,
      };
    });

    const unlocked = trophies.filter((t) => t.achieved).length;

    // Steam has no DLC achievement groups, only the base game.
    return res.status(200).json({
      total: trophies.length,
      unlocked,
      groups: [
        {
          id: "default",
          name: "Base Game",
          isDLC: false,
          total: trophies.length,
          unlocked,
          trophies,
        },
      ],
    });
  } catch (err) {
    req.log.error({ err }, "GET_STEAM_ACHIEVEMENTS_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
