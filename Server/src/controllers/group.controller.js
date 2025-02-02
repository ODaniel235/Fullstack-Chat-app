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
    const idExists = await prisma.groups.findFirst({ where: { id: idToSend } });
    if (idExists) {
      return res.status(400).json({
        error: "Group with this id already exists, try with a new ID",
      });
    }
    const group = await prisma.groups.create({
      data: {
        name,
        admins: [userId],
        avatar: avatarUrl,
        id: idToSend,
        members: { connect: { id: userId } },
        creator: userId,
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
    const isMember = group.members.some((member) => member.id === userId);
    console.log(isMember);
    if (isMember) {
      return res.status(400).json({ error: "Already a member of this group" });
    }
    // Use transaction to update both group and user atomically
    const [groupJoined, updatedUser] = await prisma.$transaction([
      prisma.groups.update({
        where: { id: group.id },
        data: {
          members: { connect: { id: userId } },
        },
        include: {
          members: true,
          messages: true,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          groups: { connect: { id: group.id } },
        },
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
          groups: true,
        },
      }),
    ]);
    console.log(groupJoined);

    // Emit events to the user
    const userSocket = getUserSocket(userId);
    if (userSocket) {
      io.to(userSocket).emit("updatedProfile", { newProfile: updatedUser });
      io.to(userSocket).emit("joinedGroup", { group: groupJoined });
    }
    const sendTousers = groupJoined.members.forEach((member) => {
      io.to(getUserSocket(member.id)).emit("joinedGroup", {
        group: groupJoined,
      });
    });

    res.status(200).json({ message: "Group joined successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const fetchGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const allGroups = await prisma.groups.findMany({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        members: true,
        messages: {
          include: {
            sender: true,
          },
        },
      },
    });
    if (!allGroups) return res.status(200).json({ groups: [] });
    res.status(200).json({ groups: allGroups });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const leaveGroup = async (req, res) => {
  console.log(req.body);
  try {
    console.log(req.params);
    const id = req.params.groupId;
    if (!id) return res.status(400).json({ error: "Group id is required" });
    const userId = req.user.id;
    if (!id || !userId) {
      return res
        .status(400)
        .json({ error: "Group id and user id are required fields" });
    }
    const groupToExit = await prisma.groups.findFirst({
      where: { id },
      include: { members: true },
    });
    if (!groupToExit) {
      return res.status(404).json({ error: "Group not found" });
    }
    const isMember = groupToExit.members.some((member) => member.id === userId);
    if (!isMember) {
      return res.status(400).json({ error: "Not a member of this group" });
    }
    const isAdmin = groupToExit.admins.some((admin) => admin === userId);
    let changeAdmins = groupToExit.admins;
    if (isAdmin) {
      changeAdmins = groupToExit.admins.filter((admin) => admin !== userId);
    }
    let isCreator = groupToExit.creator === userId;
    if (isCreator) {
      const group = await prisma.groups.findFirst({
        where: { id },
        include: { members: true },
      });
      await prisma.groups.delete({ where: { id } });

      await group.members.forEach((member) => {
        io.to(getUserSocket(member.id)).emit("exitGroup", { group: group });
      });
      return res.status(200).json({ message: "Group deleted successfully" });
    }

    const group = await prisma.groups.update({
      where: { id },
      data: {
        members: { disconnect: { id: userId } },
      },
      include: {
        members: true,
        messages: true,
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: {
        groups: { disconnect: { id } },
      },
    });
    await group.members.forEach((member) => {
      io.to(getUserSocket(member.id)).emit("leftGroup", { group: group });
    });

    io.to(getUserSocket(userId)).emit("exitGroup", { group: group });
    res.status(200).json({ message: "You have left the group" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendMessageFunction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId, content } = req.body;
    if (!groupId || !content)
      return res.status(400).json({
        error: "groupId and message content are required fields",
      });
    const newMessage = await prisma.groupMessage.create({
      data: {
        groupId,
        sender: {
          connect: {
            id: userId,
          },
        },
        content,
        isRead: [userId],
      },
    });
    console.log("Created message", newMessage);
    const group = await prisma.groups.update({
      where: { id: groupId },
      data: {
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        messages: {
          include: {
            sender: true,
          },
        },
        members: true,
      },
    });
    const allUsers = group.members.forEach((member) => {
      io.to(getUserSocket(member.id)).emit("newGroupMessage", { group });
    });
    return res
      .status(201)
      .json({ message: "Message sent successfully", group });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
