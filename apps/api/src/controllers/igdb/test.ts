import { GenericErrorMessage } from "@/constants";
import { igdb, IGDBGame } from "@/lib/igdb";
import type { Request, Response } from "express";

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
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
