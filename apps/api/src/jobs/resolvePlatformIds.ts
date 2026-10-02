import { boss } from "@/lib/boss";
import { logger } from "@/lib/logger";

const QUEUE_NAME = "resolve-platform-ids";

type ResolvePlatformIdsPayload = {
  collectionId: string;
};

export async function ensureResolvePlatformIdsQueue() {
  await boss.createQueue(QUEUE_NAME, {
    retryLimit: 2,
    retryDelay: 10,
    retryBackoff: true,
    expireInSeconds: 60,
  });
}

export async function registerResolvePlatformIds() {
  await boss.work<ResolvePlatformIdsPayload>(QUEUE_NAME, async ([job]) => {
    const { collectionId } = job.data;
    const log = logger.child({ jobId: job.id, collectionId });

    log.info("RESOLVE_PLATFORM_IDS_STARTED");

    try {
      // rest of function

      log.info("RESOLVE_PLATFORM_IDS_COMPLETED");
    } catch (err) {
      log.error({ err }, "RESOLVE_PLATFORM_IDS_FAILED");
      throw err;
    }
  });
}

export async function queueResolvePlatformIds(data: ResolvePlatformIdsPayload) {
  return boss.send(QUEUE_NAME, data, { singletonKey: data.collectionId });
}
