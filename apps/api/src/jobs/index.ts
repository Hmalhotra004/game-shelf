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
