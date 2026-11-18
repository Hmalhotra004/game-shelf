import { logger } from "@/lib/logger";
import axios from "axios";
import { PgBoss } from "pg-boss";

export const KEEP_ALIVE_QUEUE = "keep-alive-ping";

// Every 10 min, hours 12:00-23:59 and 00:00-01:59, in IST
const KEEP_ALIVE_CRON = "*/10 12-23,0-1 * * *";
const KEEP_ALIVE_TZ = "Asia/Kolkata";

export async function registerKeepAlive(boss: PgBoss) {
  await boss.createQueue(KEEP_ALIVE_QUEUE);

  await boss.work(KEEP_ALIVE_QUEUE, async ([job]) => {
    const url = `${process.env.API_URL}/api/health`;
    const startedAt = Date.now();

    logger.info({ jobId: job?.id, url }, "[keep-alive] ping started");

    try {
      const res = await axios.get(url, { timeout: 10_000 });

      logger.info(
        {
          jobId: job?.id,
          status: res.status,
          durationMs: Date.now() - startedAt,
        },
        "[keep-alive] ping succeeded",
      );
    } catch (error) {
      logger.error(
        {
          err: error,
          jobId: job?.id,
          url,
          durationMs: Date.now() - startedAt,
        },
        "[keep-alive] ping failed",
      );

      throw error;
    }
  });

  await boss.schedule(KEEP_ALIVE_QUEUE, KEEP_ALIVE_CRON, null, {
    tz: KEEP_ALIVE_TZ,
  });

  logger.info(
    { queue: KEEP_ALIVE_QUEUE, cron: KEEP_ALIVE_CRON, tz: KEEP_ALIVE_TZ },
    "[keep-alive] scheduled",
  );
}
