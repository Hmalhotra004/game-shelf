import { Router } from "express";

import { checkEmail } from "@/controllers/auth";
import { validateData } from "@/middlewares/validationMiddleware";
import { emailSchema } from "@repo/schemas/server/schemas/auth";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.post("/checkEmail", validateData(emailSchema), checkEmail);

  app.use(baseUrl, router);
};
