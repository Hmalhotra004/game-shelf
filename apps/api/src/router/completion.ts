import { getMany } from "@/controllers/completion/getMany";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { completionListQuerySchema } from "@repo/schemas/server/schemas/completion";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.query!(
    "/getMany",
    authenticateUser,
    validateData(completionListQuerySchema),
    getMany,
  );

  app.use(baseUrl, router);
};
