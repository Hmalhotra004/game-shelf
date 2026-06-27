import { GenericErrorMessage } from "@/constants";
import { getSteamProfileType } from "@repo/schemas/types/steam";
import axios from "axios";
import type { Request, Response } from "express";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const steamId = req.user?.steamId!;

    const response = await axios.get<getSteamProfileType>(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`,
      {
        params: { key: process.env.STEAM_TOKEN, steamids: steamId },
      },
    );

    const player = response.data.response.players[0];

    return res.status(200).json({
      username: player.personaname,
      avatar: player.avatarfull,
      realName: player.realname,
      profileUrl: player.profileurl,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
