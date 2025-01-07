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

  /* Disconnect Function */

  /*   socket.on("likedStatus", async (data) => {
    console.log(data);
    const statusToLike = await prisma.statusData.update({
      where: { id: data.id },
      data: {
        likes: likes + 1,
      },
    });
  }); */
  socket.on("likedStatus", async (data) => {
    const statusFetch = await prisma.statusData.findFirst({
      where: {
        id: data.statusId,
      },
    });
    const alreadyLiked = statusFetch.likes.includes(data.userId);
    let updatedLikes;
    if (alreadyLiked) {
      updatedLikes = statusFetch.likes.filter((id) => id !== data.userId);
    } else {
      updatedLikes = [...statusFetch.likes, data.userId];
    }
    const updatedStatusData = await prisma.statusData.update({
      where: { id: data.statusId },
      data: {
        likes: updatedLikes,
      },
    });
    const newStatusToSend = await prisma.status.findFirst({
      where: {
        userId: statusFetch.userId,
      },
      include: {
        statuses: true,
      },
    });

    io.to(getUserSocket(data.userId)).emit("likedStatus", {
      mine: false,
      userId: newStatusToSend.userId,
      poster: newStatusToSend.poster,
      profilePicture: newStatusToSend.profilePicture,
      status: { ...newStatusToSend.statuses },
    });
    io.to(getUserSocket(newStatusToSend.userId)).emit("newStatus", {
      mine: true,
      status: newStatusToSend,
    });
  });
  socket.on("viewedStatus", async (data) => {
    console.log(data);
  });
  socket.on("markMessageAsRead", async (data) => {
    console.log("Socket data===>", data);
    const userToUpdate = await prisma.conversation.findFirst({
      where: { id: data.id },
    });
    if (!userToUpdate) return;

    const updatedConvo = await prisma.conversation.update({
      where: { id: data.id },
      data: {
        lastMessage: {
          ...userToUpdate.lastMessage,
          isRead: true,
        },
        messages: {
          updateMany: {
            where: {
              isRead: false,
            },
            data: {
              isRead: true,
            },
          },
        },
      },
      include: {
        messages: true,
        participants: true,
      },
    });
    const otherUser = updatedConvo.participantIds.filter(
      (id) => id !== data.userId
    )[0];
    const otherUserConvos = await prisma.conversation.findMany({
      where: { participantIds: { hasSome: [otherUser] } },
      include: {
        messages: true,
        participants: true,
      },
    });
    io.to(getUserSocket(otherUser)).emit("newMessage", {
      conversation: updatedConvo,
      allConvos: otherUserConvos,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", userId);
    delete activeSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(activeSocketMap));
  });
});
export { app, server, io, getUserSocket };
