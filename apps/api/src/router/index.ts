import { Router } from "express";
import collection from "./collection";
import list from "./list";
import stats from "./stats";

const router = Router();

export default (): Router => {
  collection("/collection", router);

  list("/list", router);
  stats("/stats", router);

  return router;
};
