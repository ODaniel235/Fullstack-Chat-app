import prisma from "../db/db.js";
import { v2 as cloudinary } from "cloudinary";
import { getUserSocket, io } from "../socket/socket.js";
export const sendMessage = async (req, res) => {
  const senderId = req.user.id;
  try {
    const { receiverId, type, content } = req.body;
    if (!receiverId || !type || !content)
      return res.status(400).json({
        error: "receiverId, type and message content are required fields",
      });
    console.log(senderId, receiverId);
    let conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [senderId, receiverId],
        },
      },
    });
    console.log("Initial Convo", conversation);
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds: {
            set: [senderId, receiverId],
          },
          participants: {
            connect: [{ id: senderId }, { id: receiverId }],
          },
        },
      });
      console.log("Created Convo", conversation);
    }
    let contentLink = content;
    if (type !== "text") {
      const link = await cloudinary.uploader.upload(content, {
        folder: `${type}s`,
      });
      contentLink = link.secure_url;
    }
    const newMessage = await prisma.message.create({
      data: {
        senderId,
        conversationId: conversation.id,
        type,
        content: contentLink,
      },
    });
    console.log("Created message", newMessage);
    if (newMessage) {
      conversation = await prisma.conversation.update({
        where: {
          id: conversation.id,
        },
        data: {
          messages: {
            connect: {
              id: newMessage.id,
            },
          },

          lastMessage: {
            type: newMessage.type,
            content: newMessage.content,
            senderId: newMessage.senderId,
            status: newMessage.status,
            isRead: newMessage.isRead,
            timeStamp: newMessage.timestamp,
          },
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
    }
    const allConvos = await prisma.conversation.findMany({
      where: {
        participantIds: {
          hasSome: [receiverId],
        },
      },
      include: {
        participants: {
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    const myConvo = await prisma.conversation.findMany({
      where: {
        participantIds: {
          hasSome: [senderId],
        },
      },
      include: {
        participants: {
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    io.to(getUserSocket(senderId)).emit("newMessage", {
      conversation,
      allConvos: myConvo,
    });
    //Socket function goes here lol
    conversation.participantIds.forEach((id) => {
      io.to(getUserSocket(id)).emit("newMessage", {
        conversation,
        allConvos,
      });
    });
    res
      .status(201)
      .json({ message: "Message Sent", data: { newMessage, conversation } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const fetchMessages = async (req, res) => {
  const userId = req.user.id;
  const { recipientId } = await req.params;

  try {
    console.log(req.params);
    console.log(recipientId);
    if (!recipientId)
      return res
        .status(400)
        .json({ error: "recipientId is required in params" });
    const conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [userId, recipientId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    if (!conversation) {
      return res.status(404).json([]);
    }
    res.status(200).json(conversation.messages);
  } catch (err) {
    console.error("Error in fetchMessages", err.message);
    res.status(500).json({ error: err.message });
  }
};
export const fetchConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    const allConvos = await prisma.conversation.findMany({
      where: {
        participantIds: {
          hasSome: [userId],
        },
      },
      include: {
        participants: true, // Fetch all participants' data
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!allConvos) return res.status(404).json([]);

    // Filter participants' avatars based on privacySettings
    const processedConvos = allConvos.map((convo) => ({
      ...convo,
      participants: convo.participants.map((participant) => {
        if (participant.privacySettings?.profileVisibility === "everyone") {
          return { ...participant, avatar: participant.avatar };
        }
        return { ...participant, avatar: null }; // Hide avatar if privacy is not "everyone"
      }),
    }));

    res.status(200).json({ conversations: processedConvos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
