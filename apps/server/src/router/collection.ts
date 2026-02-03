import { getMany } from "@/controllers/collection";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getMany", authenticateUser, getMany);

  app.use(baseUrl, router);
};
