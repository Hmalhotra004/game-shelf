import { getStats } from "@/controllers/stats/getStats";
import { getOverview } from "@/controllers/stats/home/getOverview";
import { getWeeklyPlaytime } from "@/controllers/stats/home/getWeeklyPlaytime";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { validateQueryParams } from "@/middlewares/validationMiddleware";
import { weekStatsQuerySchema } from "@repo/schemas/server/schemas/stats";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getOverview", authenticateUser, getOverview);
  router.get(
    "/getWeeklyPlaytime",
    authenticateUser,
    validateQueryParams(weekStatsQuerySchema),
    getWeeklyPlaytime,
  );

  router.get("/getStats", authenticateUser, getStats);

  app.use(baseUrl, router);
};
