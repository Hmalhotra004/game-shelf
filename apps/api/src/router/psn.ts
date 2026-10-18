import { getProfile } from "@/controllers/psn/getProfile";
import { linkPSNAccount } from "@/controllers/psn/linkPSN";
import { searchByUsername } from "@/controllers/psn/searchByUsername";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifyPSN } from "@/middlewares/userMiddleware";
import { Router } from "express";

import {
  validateData,
  validateQueryParams,
} from "@/middlewares/validationMiddleware";

import {
  linkPSNAccountSchema,
  searchByUsernamePSN,
} from "@repo/schemas/server/schemas/psn";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get(
    "/searchByUsername",
    authenticateUser,
    validateQueryParams(searchByUsernamePSN),
    searchByUsername,
  );

  router.get("/getProfile", authenticateUser, verifyPSN, getProfile);

  router.patch(
    "/link",
    authenticateUser,
    validateData(linkPSNAccountSchema),
    linkPSNAccount,
  );

  app.use(baseUrl, router);
};
