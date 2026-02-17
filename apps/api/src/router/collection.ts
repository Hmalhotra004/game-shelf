import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifyCollection } from "@/middlewares/collectionMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { Router } from "express";

import {
  externalIdsSchema,
  updateImagesSchema,
} from "@repo/schemas/server/schemas/collection";

import {
  deleteCollection,
  getById,
  getMany,
  updateExternalIds,
  updateImages,
} from "@/controllers/collection";

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
