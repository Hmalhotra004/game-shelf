import { ensureResolveNPCIdQueue, registerResolveNPCId } from "./resolveNPCId";

export const backgroundJobs = async () => {
  await ensureResolveNPCIdQueue();
  await registerResolveNPCId();
};
