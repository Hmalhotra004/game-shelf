import { getToken, searchGame, test } from "@/controllers/igdb";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/search", authenticateUser, searchGame);

  router.get("/test", authenticateUser, test);

  router.post("/getToken", getToken);

  app.use(baseUrl, router);
};
