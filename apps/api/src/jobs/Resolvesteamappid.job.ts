import { boss } from "@/lib/boss";
import { logger } from "@/lib/logger";

import {
  resolveSteamAppId,
  type ResolveSteamAppIdPayload,
} from "./resolveSteamAppId";

const QUEUE_NAME = "resolve-steam-app-ids";

export async function ensureResolveSteamAppIdQueue() {
  await boss.createQueue(QUEUE_NAME, {
    retryLimit: 2,
    retryDelay: 10,
    retryBackoff: true,
    expireInSeconds: 300, // throttled Store calls: games with many DLC take a while
  });
}

export async function registerResolveSteamAppId() {
  await boss.work<ResolveSteamAppIdPayload>(QUEUE_NAME, async ([job]) => {
    const log = logger.child({
      jobId: job.id,
      collectionId: job.data.collectionId,
    });
    log.info("RESOLVE_STEAM_APP_ID_STARTED");

    try {
      await resolveSteamAppId({
        collectionId: job.data.collectionId,
        userId: job.data.userId,
      });
      log.info("RESOLVE_STEAM_APP_ID_COMPLETED");
    } catch (err) {
      log.error({ err }, "RESOLVE_STEAM_APP_ID_FAILED");
      throw err;
    }
  });
}

export async function queueResolveSteamAppId(data: ResolveSteamAppIdPayload) {
  return boss.send(QUEUE_NAME, data, { singletonKey: data.collectionId });
}
