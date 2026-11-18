import { boss } from "@/lib/boss";
import { registerKeepAlive } from "./keepAlive";
import { ensureResolveNPCIdQueue, registerResolveNPCId } from "./resolveNPCId";

import {
  ensureResolveSteamAppIdQueue,
  registerResolveSteamAppId,
} from "./Resolvesteamappid.job";

export const backgroundJobs = async () => {
  // PS
  await ensureResolveNPCIdQueue();
  await registerResolveNPCId();

  // SteamAppId
  await ensureResolveSteamAppIdQueue();
  await registerResolveSteamAppId();
};

export const cronJobs = async () => {
  await registerKeepAlive(boss);
};
