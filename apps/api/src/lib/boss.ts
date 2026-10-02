import { PgBoss } from "pg-boss";
import { logger } from "./logger";

export const boss = new PgBoss({
  schema: "pgboss",
  connectionString: process.env.DATABASE_URL_LOCAL!,
  // ssl: { rejectUnauthorized: false },
});

boss.on("error", (err) => logger.fatal({ err }, "PG_BOSS_ERROR"));

export async function startBoss() {
  await boss.start();
  return boss;
}
