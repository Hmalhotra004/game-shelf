import { getAppVersion } from "@/controllers/mobile/getVersion";
import { Router } from "express";

export default (baseUrl: string, app: Router) => {
  const router = Router();

  router.get("/getVersion", getAppVersion);

  app.use(baseUrl, router);
};
