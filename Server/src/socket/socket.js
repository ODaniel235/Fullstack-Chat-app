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
        statuses: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });
    io.to(getUserSocket(data.userId)).emit("likedStatus", {
      mine: false,
      userId: newStatusToSend.userId,
      poster: newStatusToSend.poster,
      profilePicture: newStatusToSend.profilePicture,
      status: [...newStatusToSend.statuses],
    });
    io.to(getUserSocket(newStatusToSend.userId)).emit("newStatus", {
      mine: true,
      status: newStatusToSend,
    });
  });
  socket.on("viewedStatus", async (data) => {
    console.log(data);
    const statusToEdit = await prisma.statusData.findFirst({
      where: { id: data.id },
    });
    const alreadyViewed = statusToEdit.views.includes(data.userId);
    console.log(alreadyViewed);
    if (alreadyViewed) {
      console.log("View already recorder, returning...");
      return;
    }
    const viewData = [...statusToEdit.views, data.userId];
    await prisma.statusData.update({
      where: { id: data.id },
      data: {
        views: viewData,
      },
    });
    const updatedData = await prisma.status.findFirst({
      where: { userId: data.posterId },
      include: {
        statuses: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });
    io.to(getUserSocket(data.posterId)).emit("newStatus", {
      mine: true,
      status: updatedData,
    });
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
  socket.on("sendSignal", async (data) => {
    const userSendingTo = await prisma.user.findFirst({
      where: { id: data.to },
    });
    const userBlocked = userSendingTo.blockedUsers.includes(data.from.id);
    if (userBlocked) {
      console.log("Blocked by user");
      return;
    }
    console.log("Signal Data===>", data);
    io.to(getUserSocket(data.to)).emit("incomingSignal", {
      callData: {
        type: data.type,
      },
      callerData: {
        name: data.from.name,
        id: data.from.id,
        avatar: data.from.avatar,
        email: data.from.email,
      },
      signal: data.signal,
    });
  });
  socket.on("answerCall", (data) => {
    console.log("Answer signal received:", data);
    const { signal, to } = data;

    // Forward the signal to the intended recipient
    const recipientSocket = getSocketById(to);
    if (recipientSocket) {
      recipientSocket.emit("signal", signal);
    } else {
      console.error("Recipient socket not found for ID:", to);
    }
  });
});
export { app, server, io, getUserSocket };
