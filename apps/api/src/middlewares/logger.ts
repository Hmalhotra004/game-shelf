import { logger } from "@/lib/logger";
import { randomUUID } from "crypto";
import pinoHttp from "pino-http";

export const requestLogger = pinoHttp({
  logger,
  autoLogging: false,

  genReqId: (req, res) => {
    const id = randomUUID();

    res.setHeader("x-request-id", id);

    return id;
  },

  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} completed`;
  },

  customErrorMessage(req, res, error) {
    return `${req.method} ${req.url} failed`;
  },

  customLogLevel(req, res, error) {
    if (error || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },
});
