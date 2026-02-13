import { authenticateUser } from "@/middlewares/authMiddleware";
import { Router } from "express";

import { deleteUser } from "@/controllers/user";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.delete("/deleteAccount", authenticateUser, deleteUser);

  app.use(baseUrl, router);
};
