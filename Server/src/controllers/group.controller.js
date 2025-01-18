import prisma from "../db/db.js";
import { getUserSocket, io } from "../socket/socket.js";
import uploadBase64 from "../utils/cloudinary.js";
export const createGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, name, avatar } = req.body;
    if (!name || !userId) {
      return res.status(400).json({ error: "Name and id are required fields" });
    }
    let avatarUrl;
    if (avatar) {
      avatarUrl = await uploadBase64(avatar, "images");
    }
    let idToSend = id;
    if (!id) {
      idToSend = crypto.getRandomValues(12);
    }

    const group = await prisma.groups.create({
      data: {
        name,
        admins: [userId],
        avatar: avatarUrl,
        id: idToSend,
        members: { connect: { id: userId } },
        creator: [userId],
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: {
        groups: { connect: { id: group.id } },
      },
    });
    io.to(getUserSocket(userId)).emit("groupCreated", { groupData: group });
    res.status(201).json({ message: "Group creation successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addToGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId } = req.body;
    if (!groupId || !userId)
      return res
        .status(400)
        .json({ error: "Group and User id are required fields" });
    const group = await prisma.groups.findFirst({
      where: { id: groupId },
      include: { members: true },
    });
    if (!group)
      return res
        .status(401)
        .json({ error: "Group Id is erronous or group does not exist" });
    const isMember = group.members.some((member) => {
      member.id == userId;
    });
    console.log(isMember);
    if (isMember)
      return res.status(400).json({ error: "Already a member of this group" });

    const groupJoined = await prisma.groups.update({
      where: { id: group.id },
      data: {
        members: { connect: { id: userId } },
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: {
        groups: {
          connect: {
            id: group.id,
          },
        },
      },
    });
    const user = await prisma.user.findFirst({
      where: { id: decoded.id },
      select: {
        name: true,
        id: true,
        blockedUsers: true,
        twoFactorEnabled: true,
        updatedAt: true,
        avatar: true,
        email: true,
        theme: true,
        status: true,
        location: true,
        privacySettings: true,
        password: false,
        groups: true,
      },
    });
    io.to(getUserSocket(userId)).emit("updatedProfile", {
      newProfile: updatedData,
      newStatusData,
    });
    io.to(getUserSocket(userId)).emit("joinedGroup", { group: groupJoined });
    res.status(201).json({ message: "Group joined successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
