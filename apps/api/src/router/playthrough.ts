import { add, getMany } from "@/controllers/playthrough";
import { authenticateUser } from "@/middlewares/authMiddleware";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getMany", authenticateUser, getMany);

  router.post("/add", authenticateUser, add);

  app.use(baseUrl, router);
};
