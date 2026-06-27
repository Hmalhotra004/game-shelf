import { GenericErrorMessage } from "@/constants";
import { IGDBCoverSizeType } from "@/lib/igdb/enum";
import { IGDBSearchType } from "@repo/schemas/types/igdb";
import type { Request, Response } from "express";

import {
  ExcludeGameType,
  formatImage,
  getFullYear,
  igdb,
  IGDBGame,
  IGDBPlatformIds,
  isDLC,
} from "@/lib/igdb";

export const searchGame = async (req: Request, res: Response) => {
  try {
    const { query } = req.query as { query: string };

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const safeQuery = query.replace(/"/g, "");

    const body = `
      search "${safeQuery}";
      fields ${IGDBGame.search};
      limit ${50};
      `;

    const response = await igdb.post<IGDBSearchType[]>("/games", body);

    const result = response.data
      .filter(
        (game) =>
          !ExcludeGameType.includes(game.game_type) &&
          game.platforms?.some((p) => IGDBPlatformIds.includes(p)) &&
          game.cover,
      )
      .map((game) => ({
        id: game.id,
        name: game.name,
        releaseYear: getFullYear(game.first_release_date),
        coverUrl: formatImage(game.cover.image_id, IGDBCoverSizeType.t_1080p),
        isDLC: isDLC.includes(game.game_type),
        isBundle: game.game_type === 3,
      }));

    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
