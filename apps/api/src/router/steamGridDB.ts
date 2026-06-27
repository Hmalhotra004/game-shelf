import { getGrids } from "@/controllers/steamGridDB/getGrids";
import { getHeros } from "@/controllers/steamGridDB/getHeros";
import { linkGame } from "@/controllers/steamGridDB/linkGame";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/linkGame", authenticateUser, linkGame);
  router.get("/getGrids", authenticateUser, getGrids);
  router.get("/getHeros", authenticateUser, getHeros);

  app.use(baseUrl, router);
};
