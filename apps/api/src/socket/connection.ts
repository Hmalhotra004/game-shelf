import type { TypedSocket } from "@/socket";

export const handleConnection = (socket: TypedSocket) => {
  const userId = socket.data.user?.id;

  if (userId) {
    socket.join(`user:${userId}`);
  }

  console.log("User connected:", socket.id, "User:", userId);

  // 🔥 Plug feature modules
  //  syncHandler(socket);
  //  notificationHandler(socket);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
};
