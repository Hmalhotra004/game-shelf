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
const port = Number(process.env.PORT) || 8000;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:1420","https://game-shelf-web-iota.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
  await db.execute(sql`SELECT 1`);
  console.log("database connected");
})();

const server = http.createServer(app);

app.use("/api", router());

server.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
