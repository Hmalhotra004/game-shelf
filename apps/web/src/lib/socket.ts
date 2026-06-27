import { BASEURL as SOCKET_URL } from "@repo/utils/constants";
import { io } from "socket.io-client";

import type { Socket } from "socket.io-client";

import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@repo/schemas/types/socketEvents";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SOCKET_URL,
  {
    withCredentials: true,
    autoConnect: true, // Connect automatically
    reconnection: true, // Enable reconnection
    reconnectionAttempts: 3, // Maximum number of reconnection attempts
    reconnectionDelay: 1000, // How long to wait before attempting a new reconnection
  },
);

// Add event listeners for connection status
socket.on("connect", () => {
  console.log("✅ Connected to server with id:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});
