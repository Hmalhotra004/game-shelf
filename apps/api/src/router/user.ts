import { deleteUser } from "@/controllers/user/deleteUser";
import { getGames } from "@/controllers/user/getGames";
import { linkSteamAccount } from "@/controllers/user/linkSteamAccount";
import { unlinkAccount } from "@/controllers/user/unlinkAccount";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { Router } from "express";

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
