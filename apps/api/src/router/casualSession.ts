import { addCasualSession } from "@/controllers/casualSession/addCasualSession";
import { deleteCasualSession } from "@/controllers/casualSession/deleteCasualSession";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifyCasualSession } from "@/middlewares/playthroughMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { createCasualSessionSchema } from "@repo/schemas/server/schemas/casualSession";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.post(
    "/",
    authenticateUser,
    validateData(createCasualSessionSchema),
    addCasualSession,
  );

  router.delete(
    "/:casualSessionId",
    authenticateUser,
    verifyCasualSession,
    deleteCasualSession,
  );

  app.use(baseUrl, router);
};
