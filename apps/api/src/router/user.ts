import { deleteUser } from "@/controllers/user/deleteUser";
import { getGameBasicInfo } from "@/controllers/user/getGameBasicInfo";
import { getGames } from "@/controllers/user/getGames";
import { unlinkAccount } from "@/controllers/user/unlinkAccount";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { Router } from "express";

import {
  gameBasicInfoQuerySchema,
  unlinkAccountSchema,
} from "@repo/schemas/server/schemas/user";

import {
  validateData,
  validateQueryParams,
} from "@/middlewares/validationMiddleware";

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

  router.delete("/deleteAccount", authenticateUser, deleteUser);

  app.use(baseUrl, router);
};
