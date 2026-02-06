import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifyList } from "@/middlewares/listMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { Router } from "express";

import {
  createListSchema,
  updateListSchema,
} from "@repo/schemas/server/schemas/list";

import {
  addList,
  deleteList,
  getListItems,
  getMany,
  updateList,
} from "@/controllers/list";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getMany", authenticateUser, getMany);

  router.get(
    "/:listId/getListItems",
    authenticateUser,
    verifyList,
    getListItems,
  );

  router.post(
    "/add",
    authenticateUser,
    validateData(createListSchema),
    addList,
  );

  router.patch(
    "/:listId/update",
    authenticateUser,
    verifyList,
    validateData(updateListSchema),
    updateList,
  );

  router.delete("/:listId/delete", authenticateUser, verifyList, deleteList);

  app.use(baseUrl, router);
};
