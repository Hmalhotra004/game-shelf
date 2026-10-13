import { deleteUser } from "@/controllers/user/deleteUser";
import { getGameBasicInfo } from "@/controllers/user/getGameBasicInfo";
import { getGames } from "@/controllers/user/getGames";
import { linkSteamAccount } from "@/controllers/user/linkSteamAccount";
import { unlinkAccount } from "@/controllers/user/unlinkAccount";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { gameBasicInfoQuerySchema } from "@repo/schemas/server/schemas/user";
import { Router } from "express";

import {
  validateData,
  validateQueryParams,
} from "@/middlewares/validationMiddleware";

import {
  linkSteamAccountSchema,
  unlinkAccountSchema,
} from "@repo/schemas/server/schemas/user";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getGames", authenticateUser, getGames);

  router.get(
    "/getGameBasicInfo",
    authenticateUser,
    validateQueryParams(gameBasicInfoQuerySchema),
    getGameBasicInfo,
  );

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
