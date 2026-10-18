import { getProfile } from "@/controllers/psn/getProfile";
import { searchByUsername } from "@/controllers/psn/searchByUsername";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifyPSN } from "@/middlewares/userMiddleware";
import { validateQueryParams } from "@/middlewares/validationMiddleware";
import { searchByUsernamePSN } from "@repo/schemas/server/schemas/psn";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get(
    "/searchByUsername",
    authenticateUser,
    validateQueryParams(searchByUsernamePSN),
    searchByUsername,
  );

  router.get("/getProfile", authenticateUser, verifyPSN, getProfile);

  app.use(baseUrl, router);
};
