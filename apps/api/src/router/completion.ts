import { addCompletion } from "@/controllers/completion/addCompletion";
import { deleteCompletion } from "@/controllers/completion/deleteCompletion";
import { editCompletion } from "@/controllers/completion/editCompletion";
import { getMany } from "@/controllers/completion/getMany";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifyCompletion } from "@/middlewares/completionMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { Router } from "express";

import {
  completionListQuerySchema,
  createCompletionSchema,
  updateCompletionSchema,
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

  router.patch(
    "/:completionId",
    authenticateUser,
    verifyCompletion,
    validateData(updateCompletionSchema),
    editCompletion,
  );

  router.delete(
    "/:completionId",
    authenticateUser,
    verifyCompletion,
    deleteCompletion,
  );

  app.use(baseUrl, router);
};
