import { GenericErrorMessage } from "@/constants";
import { getPSNAuthorization } from "@/lib/PsnApiAuth";
import type { Request, Response } from "express";
import { getTitleTrophies, getUserTrophiesEarnedForTitle } from "psn-api";

export const verifyNPCID = async (req: Request, res: Response) => {
  try {
    const PSNId = req.user!.PSNAccountId!;

    const { id, is5 } = req.body as { id: string; is5: boolean };

    const authorization = await getPSNAuthorization();

    const trophies = await getTitleTrophies(authorization, id, "all", {
      npServiceName: is5 ? "trophy2" : "trophy",
    });

    const earned = await getUserTrophiesEarnedForTitle(
      authorization,
      PSNId,
      id,
      "all",
      {
        npServiceName: is5 ? "trophy2" : "trophy",
      },
    );

    return res.status(200).json({ earned, trophies });
  } catch (err) {
    req.log.error({ err }, "VERIFY_NPCID_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
