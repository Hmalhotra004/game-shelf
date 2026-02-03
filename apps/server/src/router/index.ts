import { Router } from "express";
import collection from "./collection";

const router = Router();

export default (): Router => {
  collection("/collection", router);

  return router;
};
