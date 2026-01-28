import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  // router.post("/login", validateData(loginUserSchema), loginUser);

  app.use(baseUrl, router);
};
