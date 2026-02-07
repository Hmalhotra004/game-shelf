import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifyCollection } from "@/middlewares/collectionMiddleware";
import { Router } from "express";

import { deleteCollection, getMany } from "@/controllers/collection";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getMany", authenticateUser, getMany);

  router.delete(
    "/:collectionId/delete",
    authenticateUser,
    verifyCollection,
    deleteCollection,
  );

  app.use(baseUrl, router);
};
