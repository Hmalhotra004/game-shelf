import { ServerToClientEvents } from "@repo/schemas/types/socketEvents";
import { getIO } from "./index";

export const emitToUser = <K extends keyof ServerToClientEvents>(
  userId: string,
  event: K,
  ...args: Parameters<ServerToClientEvents[K]>
) => {
  const io = getIO();

  io.to(`user:${userId}`).emit(event, ...args);
};
