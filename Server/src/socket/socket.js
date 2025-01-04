import { Server } from "socket.io";
import dotenv from "dotenv";
import http from "http";
import express from "express";
import prisma from "../db/db.js";
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});
const activeSocketMap = {};
const getUserSocket = (recipientId) => {
  return activeSocketMap[recipientId];
};
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId != "undefined") activeSocketMap[userId] = socket.id;
  console.log("User connected to socket", socket.id);
  io.emit("getOnlineUsers", Object.keys(activeSocketMap));
  {
    /* Disconnect Function */
  }
  socket.on("likedStatus", async (data) => {
    console.log(data);
    const statusToLike = await prisma.statusData.update({
      where: { id: data.id },
      data: {
        likes: likes + 1,
      },
    });
  });
  socket.on("markMessageAsRead", async (data) => {
    try {
      console.log("Id ===>", data);

      // Fetch the conversation to get the current `lastMessage`
      const conversation = await prisma.conversation.findUnique({
        where: { id: data.id },
        select: { lastMessage: true },
      });

      if (!conversation || !conversation.lastMessage) {
        console.error("No conversation or lastMessage found for id:", data.id);
        return;
      }
      const updateMessage = await prisma.message.update({
        where: { id: conversation.lastMessage.id },
        data: {
          isRead: true,
        },
      });
      // Update the `lastMessage` to mark it as read
      const updatedConversation = await prisma.conversation.update({
        where: { id: data.id },
        data: {
          lastMessage: {
            ...conversation.lastMessage, // Spread the existing lastMessage fields
            isRead: true, // Mark it as read
          },
        },
        select: {
          lastMessage: true,
          createdAt: true,
          id: true,
          messages: true,
          participantIds: true,
          participants: true,
          updatedAt: true,
        },
      });
      const allConvos = await prisma.conversation.findMany({
        where: { id: data.userId },
        select: {
          lastMessage: true,
          createdAt: true,
          id: true,
          messages: true,
          participantIds: true,
          participants: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      io.emit("newMessage", { allConvos });
      const userToNotify = updatedConversation.participantIds.filter(
        (id) => id !== data.userId
      )[0];
      console.log("User to notify====>", userToNotify);
      const markAsSeen = await prisma.conversation.findMany({
        where: { participantIds: { hasSome: [userToNotify] } },
        select: {
          createdAt: true,
          id: true,
          lastMessage: true,
          messages: true,
          participantIds: true,
          participants: true,
          updatedAt: true,
        },
      });
      io.to(getUserSocket(userToNotify)).emit("newMessage", {
        allConvos: markAsSeen,
        conversation: updatedConversation,
      });
      console.log(
        "Updated lastMessage as read:",
        updatedConversation.lastMessage
      );
    } catch (err) {
      console.error("Error in markMessageAsRead:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", userId);
    delete activeSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(activeSocketMap));
  });
});
export { app, server, io, getUserSocket };
