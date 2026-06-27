import { deleteCollection } from "@/controllers/collection/deleteCollection";
import { getById } from "@/controllers/collection/getById";
import { getMany } from "@/controllers/collection/getMany";
import { updateExternalIds } from "@/controllers/collection/updateExternalIds";
import { updateImages } from "@/controllers/collection/updateImages";
import { updateSteamGridDBId } from "@/controllers/collection/updateSteamGridDBId";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifyCollection } from "@/middlewares/collectionMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { Router } from "express";

import {
  externalIdsSchema,
  updateImagesSchema,
} from "@repo/schemas/server/schemas/collection";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getMany", authenticateUser, getMany);
  router.get("/:collectionId", authenticateUser, verifyCollection, getById);

  router.patch(
    "/:collectionId/update/externalIds",
    authenticateUser,
    verifyCollection,
    validateData(externalIdsSchema),
    updateExternalIds,
  );

  router.patch(
    "/:collectionId/update/steamGridDB/:steamGridDBId",
    authenticateUser,
    verifyCollection,
    updateSteamGridDBId,
  );

  router.patch(
    "/:collectionId/update/images",
    authenticateUser,
    verifyCollection,
    validateData(updateImagesSchema),
    updateImages,
  );

  router.delete(
    "/:collectionId/delete",
    authenticateUser,
    verifyCollection,
    deleteCollection,
  );

  app.use(baseUrl, router);
};
