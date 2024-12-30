import prisma from "../db/db.js";
import { v2 as cloudinary } from "cloudinary";
import { disconnect } from "mongoose";
import cron from "node-cron";
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
      const newContent = await cloudinary.uploader.upload(content, {
        folder: `${type}s`,
      });
      contentData = newContent.secure_url;
    }
    const newStatusData = await prisma.statusData.create({
      data: {
        content: contentData,
        type,
        backgroundColor,
      },
    });
    const status = await prisma.status.update({
      where: { userId },
      data: { statuses: { connect: { id: newStatusData.id } } },
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
//Scheduling cron to auto delete statuses
cron.schedule("* * * * * ", () => {
  console.log("Running task every minute");
});
