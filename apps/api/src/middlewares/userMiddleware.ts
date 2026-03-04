import type { NextFunction, Request, Response } from "express";

export async function verifyPSN(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.user.PSNAccountId) {
      return res.status(400).json({ error: "PSN Account not linked" });
    }

    next();
  } catch (err) {
    console.error("VerifyPSN middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function verifySteamId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.user.steamId) {
      return res.status(400).json({ error: "Steam Account not linked" });
    }

    next();
  } catch (err) {
    console.error("VerifySteam middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
