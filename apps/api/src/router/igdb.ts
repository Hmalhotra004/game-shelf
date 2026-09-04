import { getById } from "@/controllers/igdb/getById";
import { getToken } from "@/controllers/igdb/getToken";
import { searchGame } from "@/controllers/igdb/searchGame";
import { test } from "@/controllers/igdb/test";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/search", authenticateUser, searchGame);

  router.get("/test", authenticateUser, test);

  router.get("/:igdbId", authenticateUser, getById);

  router.post("/getToken", getToken);

  app.use(baseUrl, router);
};
