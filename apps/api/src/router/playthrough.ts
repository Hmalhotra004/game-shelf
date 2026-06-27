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
} from "@repo/schemas/server/schemas/playthrough";

import {
  verifyPlaythrough,
  verifyPlaythroughSession,
} from "@/middlewares/playthroughMiddleware";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getMany", authenticateUser, getMany);

  router.post(
    "/add",
    authenticateUser,
    validateData(createPlaythroughSchema),
    add,
  );

  router.post(
    "/:playthroughId/addTime",
    authenticateUser,
    verifyPlaythrough,
    validateData(createPlaythroughSessionSchema),
    addTime,
  );

  router.delete(
    "/:playthroughId/delete",
    authenticateUser,
    verifyPlaythrough,
    deletePlaythrough,
  );

  router.delete(
    "/:playthroughId/:playthroughSessionId/delete",
    authenticateUser,
    verifyPlaythrough,
    verifyPlaythroughSession,
    deletePlaythroughSession,
  );

  app.use(baseUrl, router);
};
