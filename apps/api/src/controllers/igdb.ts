import { GenericErrorMessage } from "@/constants";
import { IGDBCoverSizeType } from "@/lib/igdb/enum";
import { IGDBGetByIdType, IGDBSearchType } from "@repo/schemas/types/igdb";
import axios from "axios";
import type { Request, Response } from "express";

import {
  ExcludeGameType,
  formatImage,
  getDate,
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
      }));

    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};

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
      coverUrl: formatImage(game.cover.image_id, IGDBCoverSizeType.t_1080p),
      platforms: game.platforms,
      summary: game.summary,
      releaseDate: getDate(game.first_release_date),
      genres: game.genres,
      gameType: game.game_type,
      dlcs:
        allAddons.map((dlc) => ({
          id: dlc.id,
          name: dlc.name,
          coverUrl: formatImage(dlc.cover.image_id, IGDBCoverSizeType.t_1080p),
          releaseDate: getDate(dlc.first_release_date),
        })) ?? [],
    };

    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};

export const test = async (req: Request, res: Response) => {
  try {
    const { query } = req.query as { query: string };

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const safeQuery = query.replace(/"/g, "");

    const body = `
      search "${safeQuery}";
      fields ${IGDBGame.test};
      limit ${50};
      `;

    const response = await igdb.post("/games", body);

    res.status(200).json(response.data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getToken = async (req: Request, res: Response) => {
  try {
    const response = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_SECRET}&grant_type=client_credentials`,
    );

    console.log(response.data);

    res.send(200).json();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
