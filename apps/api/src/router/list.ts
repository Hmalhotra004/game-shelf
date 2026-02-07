import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifyList, verifyListItem } from "@/middlewares/listMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { Router } from "express";

import {
  createListItemSchema,
  createListSchema,
  updateListSchema,
} from "@repo/schemas/server/schemas/list";

import {
  addList,
  addListItem,
  deleteList,
  deleteListItem,
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

  router.post(
    "/:listId/addItem",
    authenticateUser,
    verifyList,
    validateData(createListItemSchema),
    addListItem,
  );

  router.patch(
    "/:listId/update",
    authenticateUser,
    verifyList,
    validateData(updateListSchema),
    updateList,
  );

  router.delete("/:listId/delete", authenticateUser, verifyList, deleteList);

  router.delete(
    "/:listId/:listItemId/delete",
    authenticateUser,
    verifyList,
    verifyListItem,
    deleteListItem,
  );

  app.use(baseUrl, router);
};
