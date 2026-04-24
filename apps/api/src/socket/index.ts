import { ORIGINS } from "@/constants";
import type { Server as HttpServer } from "http";
import type { Socket as BaseSocket } from "socket.io";
import { Server } from "socket.io";
import { socketAuthMiddleware } from "./auth";
import { handleConnection } from "./connection";

import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@repo/schemas/types/socketEvents";

export interface SocketData {
  user: {
    id: string;
    steamId: string | null;
    PSNAccountId: string | null;
    PSNAccountUserName: string | null;
  };
}

export type TypedSocket = BaseSocket<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;

let io: Server<ClientToServerEvents, ServerToClientEvents>;

export const initSocket = (server: HttpServer) => {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: ORIGINS,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);
  io.on("connection", (socket) => handleConnection(socket));

  return io;
};

export const getIO = (): Server<ClientToServerEvents, ServerToClientEvents> => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};
