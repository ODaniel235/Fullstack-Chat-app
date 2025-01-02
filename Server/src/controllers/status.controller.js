import { status } from "@prisma/client";
import prisma from "../db/db.js";
import { v2 as cloudinary } from "cloudinary";
import { disconnect } from "mongoose";
import cron from "node-cron";
import { getUserSocket, io } from "../socket/socket.js";
export const createStatus = async (req, res) => {
  const userId = req.user.id;
  console.log(req.user.id);
  const { type, content, backgroundColor } = req.body;
  try {
    if (!type || !content)
      return res
        .status(400)
        .json({ error: "Type and content are required fields" });

    let contentData = content;
    if (type !== "text") {
      contentData = await uploa
    }
    const newStatusData = await prisma.statusData.create({
      data: {
        content: contentData,
        type,
        backgroundColor,
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
    idsToFind.forEach((id) => {
      io.to(getUserSocket(id)).emit("newStatus", { mine: false, status });
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
    const idsToFind = [];
    conversationsToFind.forEach((convo) => {
      const otherParticipants = convo.participantIds.filter(
        (id) => id !== user.id
      );
      idsToFind.push(...otherParticipants); // Add other participant IDs to idsToFind
    });
    const allStatuses = [];
    idsToFind.forEach(async (id) => {
      const newStatus = await prisma.status.findFirst({
        where: {
          userId: id,
        },
        include: {
          statuses: {
            orderBy: {
              timestamp: "asc",
            },
          },
        },
      });
      allStatuses.push(newStatus);
    });

    res.status(200).json({ myStatus: statuses, allStatuses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Scheduling cron to auto delete statuses
cron.schedule("* * * * * ", () => {
  console.log("Running task every minute");
});
