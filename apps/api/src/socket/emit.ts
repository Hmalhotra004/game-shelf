import { getIO } from "./index";

export const emitToUser = (userId: string, event: string, data: any) => {
  const io = getIO();

  io.to(`user:${userId}`).emit(event, data);
};
