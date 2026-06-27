import { getStats } from "@/controllers/stats/getStats";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getStats", authenticateUser, getStats);

  app.use(baseUrl, router);
};
