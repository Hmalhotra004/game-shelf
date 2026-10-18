import { GenericErrorMessage } from "@/constants";
import { getPSNAuthorization } from "@/lib/PsnApiAuth";
import type { Request, Response } from "express";
import { getProfileFromAccountId } from "psn-api";

// const platforms = new Set(["PS4", "PS5"]);

export const getProfile = async (req: Request, res: Response) => {
  try {
    const PSNId = req.user!.PSNAccountId!;

    const authorization = await getPSNAuthorization();

    const profile = await getProfileFromAccountId(authorization, PSNId);

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
  } catch (err) {
    req.log.error({ err }, "GET_PSN_PROFILE_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
