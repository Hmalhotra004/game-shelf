import { add, getMany } from "@/controllers/playthrough";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { Router } from "express";

import { createPlaythroughSchema } from "@repo/schemas/server/schemas/playthrough";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getMany", authenticateUser, getMany);

  router.post(
    "/add",
    authenticateUser,
    validateData(createPlaythroughSchema),
    add,
  );

  app.use(baseUrl, router);
};
