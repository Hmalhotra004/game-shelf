import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import http from "node:http";
import router from "./router";

const app = express();
const port = Number(process.env.PORT) || 8000;

app.use(
  cors({
    credentials: true,
  }),
);

app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);

app.use("/", router());

server.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
