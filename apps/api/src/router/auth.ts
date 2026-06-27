import { checkEmail } from "@/controllers/auth/checkEmail";
import { validateData } from "@/middlewares/validationMiddleware";
import { emailSchema } from "@repo/schemas/server/schemas/auth";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.post("/checkEmail", validateData(emailSchema), checkEmail);

  app.use(baseUrl, router);
};
