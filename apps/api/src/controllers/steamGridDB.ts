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
    const { steamGridDBId, steamAppId } = req.query as {
      steamAppId?: string;
      steamGridDBId?: string;
    };

    if (!steamAppId && !steamGridDBId) {
      return res.status(400).json({ error: "At least one ID is required" });
    }

    const client = new SGDB({
      key: process.env.STEAM_GRID_DB_API_KEY!,
      baseURL: "https://www.steamgriddb.com/api/v2",
    });

    let type: "steam" | "game";
    let id: number;

    if (steamGridDBId) {
      type = "game";
      id = Number(steamGridDBId);
    } else {
      type = "steam";
      id = Number(steamAppId);
    }

    const grids = await client.getGrids({
      type,
      id,
      dimensions: ["600x900"],
    });

    res.status(200).json(grids);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "An error occurred while fetching data from SteamGridDB.",
    });
  }
};

export const getHeros = async (req: Request, res: Response) => {
  try {
    const { steamGridDBId, steamAppId } = req.query as {
      steamAppId?: string;
      steamGridDBId?: string;
    };

    if (!steamAppId && !steamGridDBId) {
      return res.status(400).json({ error: "At least one ID is required" });
    }

    const client = new SGDB({
      key: process.env.STEAM_GRID_DB_API_KEY!,
      baseURL: "https://www.steamgriddb.com/api/v2",
    });

    let type: "steam" | "game";
    let id: number;

    if (steamGridDBId) {
      type = "game";
      id = Number(steamGridDBId);
    } else {
      type = "steam";
      id = Number(steamAppId);
    }

    const heros = await client.getHeroes({
      type,
      id,
      dimensions: ["1920x620", "3840x1240"],
    });

    res.status(200).json(heros);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "An error occurred while fetching data from SteamGridDB.",
    });
  }
};
