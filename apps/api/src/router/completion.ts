import { addCompletion } from "@/controllers/completion/addCompletion";
import { getMany } from "@/controllers/completion/getMany";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { Router } from "express";

import {
  completionListQuerySchema,
  createCompletionSchema,
} from "@repo/schemas/server/schemas/completion";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.query!(
    "/",
    authenticateUser,
    validateData(completionListQuerySchema),
    getMany,
  );

  router.post(
    "/",
    authenticateUser,
    validateData(createCompletionSchema),
    addCompletion,
  );

  app.use(baseUrl, router);
};
