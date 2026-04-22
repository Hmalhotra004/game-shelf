import { authenticateUser } from "@/middlewares/authMiddleware";
import { Router } from "express";

import { deleteUser, getGames, unlinkAccount } from "@/controllers/user";
import { validateData } from "@/middlewares/validationMiddleware";

import { unlinkAccountSchema } from "@repo/schemas/server/schemas/user";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getGames", authenticateUser, getGames);

  router.patch(
    "/unlinkAccount",
    authenticateUser,
    validateData(unlinkAccountSchema),
    unlinkAccount,
  );

  router.delete("/deleteAccount", authenticateUser, deleteUser);

  app.use(baseUrl, router);
};
