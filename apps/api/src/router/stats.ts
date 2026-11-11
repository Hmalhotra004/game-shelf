import { getStats } from "@/controllers/stats/getStats";
import { getOverview } from "@/controllers/stats/home/getOverview";
import { getPickNext } from "@/controllers/stats/home/getPickNext";
import { getWeeklyPlaytime } from "@/controllers/stats/home/getWeeklyPlaytime";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { validateQueryParams } from "@/middlewares/validationMiddleware";
import { Router } from "express";

import {
  pickNextQuerySchema,
  weekStatsQuerySchema,
} from "@repo/schemas/server/schemas/stats";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getOverview", authenticateUser, getOverview);
  router.get(
    "/getPickNext",
    authenticateUser,
    validateQueryParams(pickNextQuerySchema),
    getPickNext,
  );

  router.get(
    "/getWeeklyPlaytime",
    authenticateUser,
    validateQueryParams(weekStatsQuerySchema),
    getWeeklyPlaytime,
  );

  router.get("/getStats", authenticateUser, getStats);

  app.use(baseUrl, router);
};
