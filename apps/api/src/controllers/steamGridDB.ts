import { Request, Response } from "express";
import SGDB, { SGDBGame } from "steamgriddb";

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
    const { name, steamGridDBId, steamAppId } = req.query as {
      name: string | null;
      steamAppId: string | null;
      steamGridDBId: string | null;
    };

    if (!name?.trim())
      return res.status(400).json({ error: "Name is required" });

    const client = new SGDB({
      key: process.env.STEAM_GRID_DB_API_KEY!,
      baseURL: "https://www.steamgriddb.com/api/v2",
    });

    let games: SGDBGame[] = [];

    if (!steamGridDBId && !steamAppId) {
      games = await client.searchGame(name.toLowerCase());
    }

    const gridId = games.find(
      (game) => game.name === name.toLocaleLowerCase(),
    )?.id;

    const grids = await client.getGrids({
      type: "game",
      id: gridId!,
      page: 1,
      dimensions: ["600x900"],
    });

    res.status(200).json({ games, grids });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "An error occurred while fetching data from SteamGridDB.",
    });
  }
};

export const getHeros = async (req: Request, res: Response) => {};
