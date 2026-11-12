import { getHomeActivity } from "@/controllers/stats/home/getHomeActivity";
import { getHomeOnHold } from "@/controllers/stats/home/getHomeOnHold";
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

const router = Router();

router.get("/getOverview", authenticateUser, getOverview);
router.get("/getHomeActivity", authenticateUser, getHomeActivity);
router.get("/getHomeOnHold", authenticateUser, getHomeOnHold);

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

export default router;
