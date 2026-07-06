import { GenericErrorMessage } from "@/constants";
import { formatImage, getDate, igdb, IGDBGame } from "@/lib/igdb";
import { IGDBCoverSizeType } from "@/lib/igdb/enum";
import { IGDBGetByIdType } from "@repo/schemas/types/igdb";
import type { Request, Response } from "express";

// TODO: fetch steamId coverImage and handle bundle dlcs
export const getById = async (req: Request, res: Response) => {
  try {
    const igdbId = Number(req.params.igdbId);

    if (!igdbId || Number.isNaN(igdbId)) {
      return res.status(400).json({ error: "Invalid IGDB ID" });
    }

    const body = `
    fields ${IGDBGame.getById};
    where id = ${igdbId};
    `;

    const response = await igdb.post<IGDBGetByIdType[]>("/games", body);

    if (!response.data.length) {
      return res.status(404).json({ error: "Game not found" });
    }

    const game = response.data[0];

    const allAddons = [...(game.dlcs ?? []), ...(game.expansions ?? [])];

    const result = {
      id: game.id,
      name: game.name,
      image: formatImage(game.cover.image_id, IGDBCoverSizeType.t_1080p),
      platforms: game.platforms,
      summary: game.summary,
      releaseDate: getDate(game.first_release_date),
      genres: game.genres,
      gameType: game.game_type,
      dlcs:
        allAddons.map((dlc) => ({
          id: dlc.id,
          name: dlc.name,
          image: formatImage(dlc.cover.image_id, IGDBCoverSizeType.t_1080p),
          releaseDate: getDate(dlc.first_release_date),
        })) ?? [],
    };

    res.status(200).json(result);
  } catch (err) {
    req.log.error({ err }, "IGDB_GET_BY_ID_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
