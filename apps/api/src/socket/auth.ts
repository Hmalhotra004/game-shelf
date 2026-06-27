import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { Socket } from "socket.io";

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    const cookies = socket.handshake.headers.cookie;

    if (!cookies) {
      return next(new Error("Unauthorized"));
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(socket.handshake.headers),
    });

    if (!session) {
      return next(new Error("Unauthorized"));
    }

    socket.data.user = {
      id: session.user.id,
      steamId: session.user.steamId,
      PSNAccountId: session.user.PSNAccountId,
      PSNAccountUserName: session.user.PSNAccountUserName,
    };

    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
};
