import { Router } from "express";
import auth from "./auth";
import collection from "./collection";
import list from "./list";
import stats from "./stats";

const router = Router();

export default (): Router => {
  auth("/customAuth", router);

  collection("/collection", router);

  list("/list", router);
  stats("/stats", router);

  return router;
};
