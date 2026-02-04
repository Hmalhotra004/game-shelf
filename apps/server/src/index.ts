import { toNodeHandler } from "better-auth/node";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import { sql } from "drizzle-orm";
import express from "express";
import helmet from "helmet";
import http from "node:http";
import { db } from "./db";
import { auth } from "./lib/auth";
import router from "./router";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(
  cors({
    origin: ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api", router());

const server = http.createServer(app);

async function start() {
  await db.execute(sql`SELECT 1`);
  console.log("database connected");

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
