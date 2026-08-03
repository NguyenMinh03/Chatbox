import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { getUserConversationsForSocketIO } from "../controllers/conversationController.js";

export let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;
    socket.join(userId);

    const conversationIds = await getUserConversationsForSocketIO(userId);
    conversationIds.forEach((conversationId) => socket.join(conversationId));
  });

  return io;
};
