import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { user } from "@/db/schema";
import { UnlinkAccountSchemaType } from "@repo/schemas/schemas/user";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const unlinkAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const { type } = req.cleanBody as UnlinkAccountSchemaType;

    const updateMap = {
      Steam: { steamId: null },
      PSN: { PSNAccountId: null, PSNAccountUserName: null },
      Epic: {},
      XBOX: {},
    } as const;

    const updateData = updateMap[type];

    if (!updateData) {
      return res.status(400).json({ error: "Invalid provider type" });
    }

    await db.update(user).set(updateData).where(eq(user.id, userId));

    return res.sendStatus(204);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
