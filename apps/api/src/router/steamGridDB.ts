import { Router } from "express";

import { getGrids, getHeros, linkGame } from "@/controllers/steamGridDB";
import { authenticateUser } from "@/middlewares/authMiddleware";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/linkGame", authenticateUser, linkGame);
  router.get("/getGrids", authenticateUser, getGrids);
  router.get("/getHeros", authenticateUser, getHeros);

  app.use(baseUrl, router);
};
