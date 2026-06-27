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
