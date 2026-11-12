import { getStats } from "@/controllers/stats/getStats";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { Router } from "express";
import home from "./home";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.use(home);

  router.get("/getStats", authenticateUser, getStats);

  app.use(baseUrl, router);
};
