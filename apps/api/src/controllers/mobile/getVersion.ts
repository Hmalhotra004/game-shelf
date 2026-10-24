import { GenericErrorMessage } from "@/constants";
import { Request, Response } from "express";

export const getAppVersion = async (req: Request, res: Response) => {
  try {
    const LATEST_VERSION = process.env.LATEST_VERSION;
    const MIN_VERSION = process.env.MIN_VERSION;

    return res.status(200).json({
      LATEST_VERSION,
      MIN_VERSION,
    });
  } catch (err) {
    req.log.error({ err }, "GET_APP_VERSION_ERROR");
    return res.status(500).json({ message: GenericErrorMessage });
  }
};
