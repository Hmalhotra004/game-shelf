import { getProfile } from "@/controllers/steam/getProfile";
import { linkSteamAccount } from "@/controllers/steam/linkSteamAccount";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifySteamId } from "@/middlewares/userMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { linkSteamAccountSchema } from "@repo/schemas/server/schemas/steam";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getProfile", authenticateUser, verifySteamId, getProfile);

  router.patch(
    "/link",
    authenticateUser,
    validateData(linkSteamAccountSchema),
    linkSteamAccount,
  );

  app.use(baseUrl, router);
};
