import { boss } from "@/lib/boss";
import { logger } from "@/lib/logger";
import { getPSNAuthorization } from "@/lib/PsnApiAuth";
import { getUserTitles } from "psn-api";

const QUEUE_NAME = "resolve-platform-ids";

type ResolvePlatformIdsPayload = { collectionId: string };

// The code you're writing. No pg-boss in here.
export async function resolvePlatformIds(collectionId: string) {
  const log = logger.child({ collectionId });

  const authorization = await getPSNAuthorization();

  const userTitlesResponse = await getUserTitles(
    { accessToken: authorization.accessToken },
    "me",
  );

  log.info({ userTitlesResponse });
  // fetch collection, search Steam / PSN, save IDs
  // return a result object so tests can assert on it
}

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
    const log = logger.child({
      jobId: job.id,
      collectionId: job.data.collectionId,
    });
    log.info("RESOLVE_PLATFORM_IDS_STARTED");

    try {
      await resolvePlatformIds(job.data.collectionId);
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
