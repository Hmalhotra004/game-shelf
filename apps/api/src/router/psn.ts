import { getProfile } from "@/controllers/psn";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifyPSN } from "@/middlewares/userMiddleware";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getProfile", authenticateUser, verifyPSN, getProfile);

  app.use(baseUrl, router);
};
