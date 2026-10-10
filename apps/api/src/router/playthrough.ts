import { add } from "@/controllers/playthroughs/add";
import { addTime } from "@/controllers/playthroughs/addTime";
import { deletePlaythrough } from "@/controllers/playthroughs/deletePlaythrough";
import { deletePlaythroughSession } from "@/controllers/playthroughs/deletePlaythroughSession";
import { getMany } from "@/controllers/playthroughs/getMany";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { Router } from "express";

import {
  createPlaythroughSchema,
  createPlaythroughSessionSchema,
  playthroughListQuerySchema,
} from "@repo/schemas/server/schemas/playthrough";

import {
  verifyPlaythrough,
  verifyPlaythroughSession,
} from "@/middlewares/playthroughMiddleware";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.query!(
    "/",
    authenticateUser,
    validateData(playthroughListQuerySchema),
    getMany,
  );

  router.post(
    "/",
    authenticateUser,
    validateData(createPlaythroughSchema),
    add,
  );

  router.post(
    "/:playthroughId",
    authenticateUser,
    verifyPlaythrough,
    validateData(createPlaythroughSessionSchema),
    addTime,
  );

  router.delete(
    "/:playthroughId",
    authenticateUser,
    verifyPlaythrough,
    deletePlaythrough,
  );

  router.delete(
    "/:playthroughId/:playthroughSessionId",
    authenticateUser,
    verifyPlaythrough,
    verifyPlaythroughSession,
    deletePlaythroughSession,
  );

  app.use(baseUrl, router);
};
