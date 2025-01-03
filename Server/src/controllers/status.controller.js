import { status } from "@prisma/client";
import prisma from "../db/db.js";
import { v2 as cloudinary } from "cloudinary";
import { disconnect } from "mongoose";
import cron from "node-cron";
import { getUserSocket, io } from "../socket/socket.js";
import uploadBase64 from "../utils/cloudinary.js";
export const createStatus = async (req, res) => {
  const userId = req.user.id;
  const { type, content, backgroundColor } = req.body;
  try {
    if (!type || !content)
      return res
        .status(400)
        .json({ error: "Type and content are required fields" });

    let contentData = content;
    if (type !== "text") {
      try {
        contentData = await uploadBase64(content, `${type}s`);
      } catch (uploadError) {
        return res
          .status(500)
          .json({ error: "File upload failed", details: uploadError.message });
      }
    }
    const newStatusData = await prisma.statusData.create({
      data: {
        content: contentData,
        type,
        backgroundColor: backgroundColor || null,
        userId: userId,
      },
    });
    const status = await prisma.status.update({
      where: { userId }, // Ensure userId matches the record you want to update
      data: {
        statuses: {
          connect: { id: newStatusData.id }, // Connects the new status by ID
        },
      },
      select: {
        profilePicture: true,
        poster: true,
        userId: true,
        statuses: true,
      },
    });

    io.to(getUserSocket(userId)).emit("newStatus", { mine: true, status });
    const conversationsToFind = await prisma.conversation.findMany({
      where: { participantIds: { hasSome: [userId] } },
    });
    const idsToFind = [];
    conversationsToFind.forEach((convo) => {
      const otherParticipants = convo.participantIds.filter(
        (id) => id !== userId
      );
      idsToFind.push(...otherParticipants); // Add other participant IDs to idsToFind
    });
    // Notify all other participants
    idsToFind.forEach((id) => {
      const userSocket = getUserSocket(id); // Fetch the socket for this user
      console.log(userSocket);
      if (userSocket) {
        io.to(userSocket).emit("newStatus", {
          mine: false,
          userId: status.userId, // ID of the user who posted the status
          poster: status.poster,
          profilePicture: status.profilePicture,
          status: {
            ...newStatusData,
          },
        });
      }
    });
    //To do socket event here
    res.status(201).json({
      message: "Status created successfully",
      newStatus: newStatusData,
      status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const deleteStatus = async (req, res) => {
  const userId = req.user.id;
  const { statusId } = req.query;
  try {
    if (!statusId)
      return res.status(400).json({ error: "Status id is a required field" });
    const isOwner = await prisma.statusData.findFirst({
      where: { id: statusId, userId },
    });
    if (!isOwner)
      return res
        .status(401)
        .json({ error: "Status not found or not owned by this user" });
    await prisma.statusData.delete({ where: { id: statusId } });
    const updatedStatusData = await prisma.status.update({
      where: { userId },
      data: {
        statuses: {
          disconnect: {
            id: statusId,
          },
        },
      },
    });
    res
      .status(200)
      .json({ message: "Status deleted successfully", updatedStatusData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const deleteByTimestamp = async (req, res) => {
  try {
    const currentTime = new Date();
    const statusToDelete = await prisma.statusData.findMany({
      where: {
        timestamp: {
          lt: new Date(currentTime.getTime() - 1 * 60 * 1000), //Using a  minute to test, update here 24 * 60 * 60 * 1000
        },
      },
    });
    for (const status of statusToDelete) {
      await prisma.statusData.delete({
        where: {
          id: status.id,
        },
      });
      await prisma.status.updateMany({
        where: {
          userId: status.userId,
        },
        data: {
          statuses: {
            disconnect: {
              id: status.id,
            },
          },
        },
      });
    }
    res.status(200).json({ message: "Statuses older than 24hrs deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const fetchStatuses = async (req, res) => {
  const user = req.user;
  try {
    const statuses = await prisma.status.findFirst({
      where: { userId: user.id },
      include: {
        statuses: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });
    const conversationsToFind = await prisma.conversation.findMany({
      where: { participantIds: { hasSome: [user.id] } },
    });
    const idsToFind = new Set();
    conversationsToFind.forEach((convo) => {
      const otherParticipants = convo.participantIds.filter(
        (id) => id !== user.id
      );
      otherParticipants.forEach((id) => idsToFind.add(id)); // Adds IDs to the Set
    });

    // Use Promise.all to handle the async operations correctly
    const statusesPromises = [...idsToFind].map(async (id) => {
      const newStatus = await prisma.status.findFirst({
        where: {
          userId: id, // Ensure to pass `id` directly as you're filtering in participantIds
        },
        include: {
          statuses: {
            orderBy: {
              timestamp: "asc",
            },
          },
        },
      });
      return newStatus; // Return the status for later use
    });

    const fetchedStatuses = await Promise.all(statusesPromises);

    // Now filter for unique statuses if needed (optional)
    const uniqueStatuses = fetchedStatuses.filter((status, index, self) => {
      return index === self.findIndex((s) => s.userId === status.userId); // Assuming `userId` is unique
    });

    res.status(200).json({ myStatus: statuses, allStatuses: uniqueStatuses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Scheduling cron to auto delete statuses
cron.schedule("* * * * * ", () => {
  console.log("Running task every minute");
});
