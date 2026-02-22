import axios from "axios";
import { Request, Response } from "express";
import SGDB from "steamgriddb";

export const linkGame = async (req: Request, res: Response) => {
  try {
    const { name } = req.query as { name: string };

    if (!name?.trim())
      return res.status(400).json({ error: "Name is required" });

    const client = new SGDB({
      key: process.env.STEAM_GRID_DB_API_KEY!,
      baseURL: "https://www.steamgriddb.com/api/v2",
    });

    const games = await client.searchGame(name.toLowerCase());

    res.status(200).json(games);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "An error occurred while fetching data from SteamGridDB.",
    });
  }
};

export const getGrids = async (req: Request, res: Response) => {
  try {
    const { steamGridDBId, steamAppId, page, nsfw } = req.query as {
      steamAppId?: string;
      steamGridDBId?: string;
      page?: string;
      nsfw?: boolean;
    };

    if (!steamAppId && !steamGridDBId) {
      return res.status(400).json({ error: "At least one ID is required" });
    }

    const isAdult = req.user!.isAdult;

    let type: "steam" | "game";
    let id: number;

    if (steamGridDBId) {
      type = "game";
      id = Number(steamGridDBId);
    } else {
      type = "steam";
      id = Number(steamAppId);
    }

    const currentPage = Number(page) || 0;

    const response = await axios.get(
      `https://www.steamgriddb.com/api/v2/grids/${type}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STEAM_GRID_DB_API_KEY}`,
        },
        params: {
          page: currentPage,
          dimensions: "600x900",
          types: ["static", "animated"].join(","),
          nsfw: isAdult ? nsfw : false,
          humor: "any",
          epilepsy: "any",
        },
      },
    );

    res.status(200).json(response.data);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "An error occurred while fetching data from SteamGridDB.",
    });
  }
};

export const getHeros = async (req: Request, res: Response) => {
  try {
    const { steamGridDBId, steamAppId, page, nsfw } = req.query as {
      steamAppId?: string;
      steamGridDBId?: string;
      page?: string;
      nsfw?: boolean;
    };

    if (!steamAppId && !steamGridDBId) {
      return res.status(400).json({ error: "At least one ID is required" });
    }

    const isAdult = req.user!.isAdult;

    let type: "steam" | "game";
    let id: number;

    if (steamGridDBId) {
      type = "game";
      id = Number(steamGridDBId);
    } else {
      type = "steam";
      id = Number(steamAppId);
    }

    const currentPage = Number(page) || 0;

    const response = await axios.get(
      `https://www.steamgriddb.com/api/v2/heroes/${type}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STEAM_GRID_DB_API_KEY}`,
        },
        params: {
          page: currentPage,
          types: ["static", "animated"].join(","),
          nsfw: isAdult ? nsfw : false,
          humor: "any",
          epilepsy: "any",
        },
      },
    );

    res.status(200).json(response.data);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "An error occurred while fetching data from SteamGridDB.",
    });
  }
};
