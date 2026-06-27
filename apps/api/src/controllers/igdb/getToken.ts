import { GenericErrorMessage } from "@/constants";
import axios from "axios";
import type { Request, Response } from "express";

export const getToken = async (req: Request, res: Response) => {
  try {
    const response = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_SECRET}&grant_type=client_credentials`,
    );

    console.log(response.data);

    res.send(200).json();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
