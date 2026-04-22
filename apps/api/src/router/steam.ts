import { getProfile } from "@/controllers/steam";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifySteamId } from "@/middlewares/userMiddleware";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getProfile", authenticateUser, verifySteamId, getProfile);

  app.use(baseUrl, router);
};
