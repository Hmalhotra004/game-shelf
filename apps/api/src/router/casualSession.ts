import { addCasualSession } from "@/controllers/casualSession/addCasualSession";
import { deleteCasualSession } from "@/controllers/casualSession/deleteCasualSession";
import { updateCasualSession } from "@/controllers/casualSession/updateCasualSession";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifyCasualSession } from "@/middlewares/playthroughMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { Router } from "express";

import {
  createCasualSessionSchema,
  updateCasualSessionSchema,
} from "@repo/schemas/server/schemas/casualSession";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.post(
    "/",
    authenticateUser,
    validateData(createCasualSessionSchema),
    addCasualSession,
  );

  router.patch(
    "/:casualSessionId",
    authenticateUser,
    validateData(updateCasualSessionSchema),
    updateCasualSession,
  );

  router.delete(
    "/:casualSessionId",
    authenticateUser,
    verifyCasualSession,
    deleteCasualSession,
  );

  app.use(baseUrl, router);
};
