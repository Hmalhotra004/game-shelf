import { db } from "@/db";
import { auth } from "@/lib/auth";
import router from "@/router";
import { toNodeHandler } from "better-auth/node";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import { sql } from "drizzle-orm";
import express from "express";
import helmet from "helmet";
import http from "node:http";
import { ORIGINS } from "./constants";
import { boss, startBoss } from "./lib/boss";
import { isProd } from "./lib/isProd";
import { logger } from "./lib/logger";
import { redis } from "./lib/redis";
import { requestLogger } from "./middlewares/logger";

import {
  ensureResolvePlatformIdsQueue,
  registerResolvePlatformIds,
} from "@/jobs/resolvePlatformIds";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(
  cors({
    origin: ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(requestLogger);
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api", router());

const server = http.createServer(app);

async function start() {
  await redis.connect();
  logger.info("Redis connected");

  await db.execute(sql`SELECT 1`);
  logger.info("Database Connected");

  // initSocket(server);

  // Boss + queues BEFORE accepting traffic
  await startBoss();
  await ensureResolvePlatformIdsQueue();
  await registerResolvePlatformIds();

  server.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

async function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down");
  server.close();
  await boss.stop({ graceful: true, timeout: 30_000 });
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

try {
  await start();

  logger.info({
    prod: isProd(),
  });

  // await resolvePlatformIds();
} catch (err) {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
}
