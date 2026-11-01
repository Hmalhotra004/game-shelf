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
    const steamId = req.user.steamId!;
    const steamAppId = req.collection.steamAppId;

    if (!steamAppId) {
      return res.status(400).json({ error: "Game has no Steam app ID" });
    }

    const [schema, progress, globalPercent] = await Promise.all([
      fetchGameSchema(steamAppId),
      fetchPlayerProgress(steamAppId, steamId),
      fetchGlobalPercentages(steamAppId),
    ]);

    // No achievements for this game, or the profile/stats are private.
    if (schema.length === 0 || !progress) {
      return res.status(200).json(EMPTY_RESULT);
    }

    const trophies = schema.map((a) => {
      const earned = progress.get(a.name);
      // Missing global % (new/obscure game) falls back to 100 => most common.
      const percent = globalPercent.get(a.name) ?? 100;

      return {
        id: a.name,
        name: a.displayName,
        description:
          a.description?.trim() || (a.hidden === 1 ? "Hidden achievement" : ""),
        icon: a.icon || undefined,
        iconGray: a.icongray || undefined,
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
