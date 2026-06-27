// import { db } from "@/db";
// import { GetOwnedGamesSteamType } from "@repo/schemas/types/steam";
// import axios from "axios";
// import { and, eq, sql } from "drizzle-orm";
// import { collection, completion, dlc, playthrough } from "@/db/schema";

import { GenericErrorMessage } from "@/constants";
import type { Request, Response } from "express";
import psn from "psn-api";

const platforms = new Set(["PS4", "PS5"]);
const npsso = process.env.PSNNPPSO!;

export const getProfile = async (req: Request, res: Response) => {
  try {
    const PSNId = req.user!.PSNAccountId!;

    const accessCode = await psn.exchangeNpssoForAccessCode(npsso);
    const authorization = await psn.exchangeAccessCodeForAuthTokens(accessCode);

    const profile = await psn.getProfileFromAccountId(authorization, PSNId);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.status(200).json({
      username: profile.onlineId,
      avatar:
        profile.avatars.find((a) => a.size === "m")?.url ??
        profile.avatars.find((a) => a.size === "l")?.url,
      realName: null,
      profileUrl: null,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
