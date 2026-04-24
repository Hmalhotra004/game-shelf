import { authenticateUser } from "@/middlewares/authMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { Router } from "express";

import {
  deleteUser,
  getGames,
  linkSteamAccount,
  unlinkAccount,
} from "@/controllers/user";

import {
  linkSteamAccountSchema,
  unlinkAccountSchema,
} from "@repo/schemas/server/schemas/user";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getGames", authenticateUser, getGames);

  router.patch(
    "/unlinkAccount",
    authenticateUser,
    validateData(unlinkAccountSchema),
    unlinkAccount,
  );

  router.patch(
    "/linkSteamAccount",
    authenticateUser,
    validateData(linkSteamAccountSchema),
    linkSteamAccount,
  );

  router.delete("/deleteAccount", authenticateUser, deleteUser);

  app.use(baseUrl, router);
};
