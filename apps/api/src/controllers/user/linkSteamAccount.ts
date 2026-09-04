import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { user } from "@/db/schema";
import { LinkSteamAccountSchemaType } from "@repo/schemas/schemas/user";
import axios from "axios";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

import {
  GetOwnedGamesSteamType,
  getSteamProfileType,
} from "@repo/schemas/types/steam";

export const linkSteamAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const { steamId } = req.cleanBody as LinkSteamAccountSchemaType;

    if (!/^\d{17}$/.test(steamId)) {
      return res.status(400).json({ error: "Invalid Steam ID format" });
    }

    const response = await axios.get<getSteamProfileType>(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`,
      {
        params: { key: process.env.STEAM_TOKEN, steamids: steamId },
      },
    );

    const player = response.data.response.players?.[0];

    if (!player) {
      return res.status(404).json({
        error: "Steam account not found",
      });
    }

    const gamesRes = await axios.get<GetOwnedGamesSteamType>(
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/",
      {
        params: {
          key: process.env.STEAM_TOKEN,
          steamid: steamId,
        },
      },
    );

    if (!gamesRes.data.response || !gamesRes.data.response.game_count) {
      return res.status(403).json({
        error: "Steam profile data is private",
      });
    }

    await db
      .update(user)
      .set({
        steamId,
      })
      .where(eq(user.id, userId));

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "LINK_STEAM_ACCOUNT_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
