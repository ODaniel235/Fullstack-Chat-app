import { Server } from "socket.io";
import dotenv from "dotenv";
import http from "http";
import express from "express";
import cors from "cors";
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const activeSocketMap = {};
const getUserSocket = (recipientId) => {
  return activeSocketMap[recipientId];
};
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId != "undefined") userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  {
    /* Disconnect Function */
  }
  socket.on("disconnect", () => {
    console.log("User disconnected", userId);
    delete activeSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
export { app, server, io, getUserSocket };
