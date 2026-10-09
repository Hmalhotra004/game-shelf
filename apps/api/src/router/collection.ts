import { addCollection } from "@/controllers/collection/add";
import { archiveCollection } from "@/controllers/collection/archiveCollection";
import { deleteCollection } from "@/controllers/collection/deleteCollection";
import { getById } from "@/controllers/collection/getById";
import { getByIdForEdit } from "@/controllers/collection/getByIdForEdit";
import { getMany } from "@/controllers/collection/getMany";
import { updateExternalIds } from "@/controllers/collection/updateExternalIds";
import { updateImages } from "@/controllers/collection/updateImages";
import { updateSteamGridDBId } from "@/controllers/collection/updateSteamGridDBId";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifyCollection } from "@/middlewares/collectionMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { Router } from "express";

import {
  collectionListQuerySchema,
  createCollectionSchema,
  externalIdsSchema,
  updateImagesSchema,
} from "@repo/schemas/server/schemas/collection";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.query!(
    "/",
    authenticateUser,
    validateData(collectionListQuerySchema),
    getMany,
  );

  router.get("/:collectionId", authenticateUser, verifyCollection, getById);
  router.get(
    "/:collectionId/edit",
    authenticateUser,
    verifyCollection,
    getByIdForEdit,
  );

  router.post(
    "/",
    authenticateUser,
    validateData(createCollectionSchema),
    addCollection,
  );

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

  router.patch(
    "/:collectionId/archive",
    authenticateUser,
    verifyCollection,
    archiveCollection,
  );

  router.delete(
    "/:collectionId",
    authenticateUser,
    verifyCollection,
    deleteCollection,
  );

  app.use(baseUrl, router);
};
