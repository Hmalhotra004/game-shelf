import { addList, getListItems, getMany } from "@/controllers/list";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { verifyList } from "@/middlewares/listMiddleware";
import { validateData } from "@/middlewares/validationMiddleware";
import { createListSchema } from "@repo/schemas/server/schemas/list";
import { Router } from "express";

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

  app.use(baseUrl, router);
};
