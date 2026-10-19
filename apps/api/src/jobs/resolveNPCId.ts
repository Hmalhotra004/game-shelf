import { db } from "@/db";
import { collection } from "@/db/schema";
import { boss } from "@/lib/boss";
import { logger } from "@/lib/logger";
import { getPSNAuthorization } from "@/lib/PsnApiAuth";
import { normalize } from "@/lib/utils";
import { PSVersionTrophyType, PSVersionType } from "@repo/schemas/types/index";
import { eq } from "drizzle-orm";
import { getUserTitles } from "psn-api";

const QUEUE_NAME = "resolve-npc-ids";
const PAGE_SIZE = 800;

type ResolveNPCIdPayload = {
  collectionId: string;
  PSNAccountId: string;
  collectionName: string;
  PSVersion: PSVersionType[];
};

// The code you're writing. No pg-boss in here.
export async function resolveNPCId({
  collectionId,
  PSNAccountId,
  collectionName,
  PSVersion,
}: ResolveNPCIdPayload) {
  const log = logger.child({ collectionId });

  // Only PS3/PS4/PS5 have trophy IDs (matches the DB constraint)
  const versions = PSVersion.filter(
    (v): v is PSVersionTrophyType => v !== "PS1" && v !== "PS2",
  );

  if (!versions.length) {
    log.info("RESOLVE_NPC_ID_SKIPPED_NO_TROPHY_VERSIONS");
    return { resolved: {}, unresolved: [] as PSVersionTrophyType[] };
  }

  const authorization = await getPSNAuthorization();

  // Fetch every page of the user's trophy titles
  const titles = [];
  let offset = 0;
  while (true) {
    const page = await getUserTitles(
      { accessToken: authorization.accessToken },
      PSNAccountId,
      { limit: PAGE_SIZE, offset },
    );
    titles.push(...page.trophyTitles);
    if (page.nextOffset === undefined || page.nextOffset === null) break;
    offset = page.nextOffset;
  }

  const needle = normalize(collectionName);

  const candidates = titles.map((t) => ({
    name: t.trophyTitleName,
    normalized: normalize(t.trophyTitleName),
    npCommunicationId: t.npCommunicationId,
    platforms: t.trophyTitlePlatform.split(",").map((p) => p.trim()),
  }));

  const resolved: Partial<Record<PSVersionTrophyType, string>> = {};
  const unresolved: PSVersionTrophyType[] = [];

  for (const version of versions) {
    const forVersion = candidates.filter((c) => c.platforms.includes(version));

    // Prefer an exact name match, fall back to "contains"
    const exact = forVersion.filter((c) => c.normalized === needle);
    const matches = exact.length
      ? exact
      : forVersion.filter((c) => c.normalized.includes(needle));

    if (matches.length === 1) {
      resolved[version] = matches[0].npCommunicationId;
    } else {
      unresolved.push(version);
      log.warn(
        { version, matches: matches.map((m) => m.name) },
        matches.length
          ? "RESOLVE_NPC_ID_AMBIGUOUS"
          : "RESOLVE_NPC_ID_NOT_FOUND",
      );
    }
  }

  if (Object.keys(resolved).length) {
    await db
      .update(collection)
      .set({ npCommunicationIds: resolved })
      .where(eq(collection.id, collectionId));
  }

  log.info({ resolved, unresolved }, "RESOLVE_NPC_ID_RESULT");
  return { resolved, unresolved };
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
      await resolveNPCId({
        collectionId: job.data.collectionId,
        PSNAccountId: job.data.PSNAccountId,
        collectionName: job.data.collectionName,
        PSVersion: job.data.PSVersion,
      });
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
