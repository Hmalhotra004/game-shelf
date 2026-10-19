import { boss } from "@/lib/boss";
import { logger } from "@/lib/logger";
import { getPSNAuthorization } from "@/lib/PsnApiAuth";
import { normalize } from "@/lib/utils";
import { getUserTitles } from "psn-api";

const QUEUE_NAME = "resolve-npc-ids";

type ResolveNPCIdPayload = {
  collectionId: string;
  PSNAccountId: string;
};

// The code you're writing. No pg-boss in here.
export async function resolveNPCId(collectionId: string, PSNAccountId: string) {
  const log = logger.child({ collectionId });

  const authorization = await getPSNAuthorization();

  const userTitlesResponse = await getUserTitles(
    { accessToken: authorization.accessToken },
    PSNAccountId,
  );

  const needle = normalize("resident evil");

  const assassinsTitles = userTitlesResponse.trophyTitles.filter((t) =>
    normalize(t.trophyTitleName).includes(needle),
  );

  const withPlatforms = assassinsTitles.map((t) => ({
    name: t.trophyTitleName,
    npCommunicationId: t.npCommunicationId,
    platforms: t.trophyTitlePlatform.split(",").map((p) => p.trim()),
    progress: t.progress,
  }));

  log.info({ count: withPlatforms.length, titles: withPlatforms });

  // log.info({ userTitlesResponse });
  // fetch collection, search Steam / PSN, save IDs
  // return a result object so tests can assert on it
}

export async function ensureResolveNPCIdQueue() {
  await boss.createQueue(QUEUE_NAME, {
    retryLimit: 2,
    retryDelay: 10,
    retryBackoff: true,
    expireInSeconds: 60,
  });
}

export async function registerResolveNPCId() {
  await boss.work<ResolveNPCIdPayload>(QUEUE_NAME, async ([job]) => {
    const log = logger.child({
      jobId: job.id,
      collectionId: job.data.collectionId,
    });
    log.info("RESOLVE_NPC_ID_STARTED");

    try {
      await resolveNPCId(job.data.collectionId, job.data.PSNAccountId);
      log.info("RESOLVE_NPC_ID_COMPLETED");
    } catch (err) {
      log.error({ err }, "RESOLVE_NPC_ID_FAILED");
      throw err;
    }
  });
}

export async function queueResolveNPCId(data: ResolveNPCIdPayload) {
  return boss.send(QUEUE_NAME, data, { singletonKey: data.collectionId });
}
