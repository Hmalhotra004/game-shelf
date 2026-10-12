import { getGameInfoForCompletion } from "@/controllers/completion/getGameInfoForCompletion";
import { getMany } from "@/controllers/completion/getMany";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { validateQueryParams } from "@/middlewares/validationMiddleware";
import { gameInfoCompletionQuerySchema } from "@repo/schemas/server/schemas/completion";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getMany", authenticateUser, getMany);

  router.get(
    "/getGameInfoForCompletion",
    authenticateUser,
    validateQueryParams(gameInfoCompletionQuerySchema),
    getGameInfoForCompletion,
  );

  app.use(baseUrl, router);
};
