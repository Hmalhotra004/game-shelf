import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

import type { Request, Response } from "express";

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    await db.delete(user).where(eq(user.id, userId));

    return res.sendStatus(204);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
