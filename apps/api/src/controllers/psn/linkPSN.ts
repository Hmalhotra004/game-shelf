import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getPSNAuthorization } from "@/lib/PsnApiAuth";
import { LinkPSNAccountSchemaType } from "@repo/schemas/server/schemas/psn";
import { eq, sql } from "drizzle-orm";
import type { Request, Response } from "express";
import { getProfileFromAccountId } from "psn-api";

export const linkPSNAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const { PSNAccountId } = req.cleanBody as LinkPSNAccountSchemaType;

    const authorization = await getPSNAuthorization();

    const profile = await getProfileFromAccountId(authorization, PSNAccountId);

    if (!profile) {
      return res.status(404).json({ error: "Profile not Public" });
    }

    const avatar =
      profile.avatars.find((a) => a.size === "m")?.url ??
      profile.avatars.find((a) => a.size === "l")?.url;

    await db
      .update(user)
      .set({
        PSNAccountId,
        image: sql`COALESCE(NULLIF(${user.image}, ''), ${avatar})`,
      })
      .where(eq(user.id, userId));

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "LINK_PSN_ACCOUNT_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
