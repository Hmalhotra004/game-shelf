import { PgBoss } from "pg-boss";
import { isProd } from "./isProd";
import { logger } from "./logger";

const connectionString = isProd()
  ? process.env.DATABASE_URL_PROD
  : process.env.DATABASE_URL_LOCAL;

if (!connectionString) {
  throw new Error(
    `Database URL missing for pg-boss (${isProd() ? "DATABASE_URL_PROD" : "DATABASE_URL_LOCAL"})`,
  );
}

export const boss = new PgBoss({
  schema: "pgboss",
  connectionString,
});

boss.on("error", (err) => logger.fatal({ err }, "PG_BOSS_ERROR"));

export async function startBoss() {
  await boss.start();
  return boss;
}
