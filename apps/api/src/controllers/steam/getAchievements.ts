import { GenericErrorMessage } from "@/constants";
import type { Request, Response } from "express";

export const getAchievements = async (req: Request, res: Response) => {
  try {
    
  } catch (err) {
    req.log.error({ err }, "GET_STEAM_ACHIEVEMENTS_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
