import { Router } from "express";

import { getGrids, getHeros, linkGame } from "@/controllers/steamGridDB";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/linkGame", linkGame);
  router.get("/getGrids", getGrids);
  router.get("/getHeros", getHeros);

  app.use(baseUrl, router);
};
