import { Router } from "express";
import auth from "./auth";
import collection from "./collection";
import completion from "./completion";
import list from "./list";
import playthrough from "./playthrough";
import psn from "./psn";
import stats from "./stats";
import steam from "./steam";
import steamGridDB from "./steamGridDB";
import user from "./user";

const router = Router();

export default (): Router => {
  auth("/customAuth", router);

  user("/user", router);

  collection("/collection", router);
  playthrough("/playthrough", router);
  completion("/completion", router);

  list("/list", router);
  stats("/stats", router);

  steamGridDB("/steamGridDB", router);
  psn("/PSN", router);
  steam("/steam", router);

  return router;
};
