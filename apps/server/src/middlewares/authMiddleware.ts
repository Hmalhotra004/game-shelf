import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";

export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.session || !session.user?.id) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
