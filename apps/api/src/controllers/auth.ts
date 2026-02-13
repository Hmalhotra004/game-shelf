import { db } from "@/db";

import type { EmailSchemaType } from "@repo/schemas/schemas/auth";
import type { Request, Response } from "express";

export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.cleanBody as EmailSchemaType;

    const userExists = await db.query.user.findFirst({
      columns: { email: true, id: true },
      where: (u, { eq }) => eq(u.email, email),
    });

    if (!userExists) {
      return res.status(404).json({ error: "Email not registered" });
    }

    return res.sendStatus(204);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
