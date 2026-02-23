import { Router } from "express";
import auth from "./auth";
import collection from "./collection";
import list from "./list";
import playthrough from "./playthrough";
import stats from "./stats";
import steamGridDB from "./steamGridDB";
import user from "./user";

const router = Router();

export default (): Router => {
  auth("/customAuth", router);

  user("/user", router);

  collection("/collection", router);
  playthrough("/playthrough", router);

  list("/list", router);
  stats("/stats", router);

  steamGridDB("/steamGridDB", router);

  return router;
};
