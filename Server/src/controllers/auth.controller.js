import bcrypt from "bcryptjs";
import prisma from "../db/db.js";
import { generateNumbers, signToken } from "../utils/utils.js";
import uploadBase64 from "../utils/cloudinary.js";
import { getUserSocket, io } from "../socket/socket.js";
import sendOTPByEmail from "../utils/sendMail.js";
export const signup = async (req, res) => {
  const { firstname, lastname, email, password, type, avatar } = req.body;
  try {
    // Validate required fields
    if (!email || !lastname || !firstname)
      return res
        .status(400)
        .json({ error: "Email, firstname, and lastname are required fields" });

    // Check if user already exists
    const userExists = await prisma.user.findFirst({ where: { email } });

    let newUser;

    // Handle passwordless signup
    if (type === "passwordless") {
      if (userExists) {
        return res
          .status(401)
          .json({ error: "An account already exists with this credential" });
      } else {
        newUser = await prisma.user.create({
          data: {
            name: `${firstname} ${lastname}`,
            avatar: avatar || null,
            email,
            theme: "system",
            status: "online",
            privacySettings: {
              showOnlineStatus: true,
              readReceipts: true,
              profileVisibility: "everyone",
            },
          },
        });
      }
    } else {
      if (!password)
        return res.status(400).json({ error: "Please input a password" });
      if (userExists)
        return res
          .status(401)
          .json({ error: "An account already exists with this credential" });
      const hashedPassword = await bcrypt.hash(password, 12);
      newUser = await prisma.user.create({
        data: {
          name: `${firstname} ${lastname}`,
          email,
          theme: "system",
          status: "online",
          password: hashedPassword,
          privacySettings: {
            showOnlineStatus: true,
            readReceipts: true,
            profileVisibility: "everyone",
            blockedUsers: [],
          },
        },
      });
    }
    const newStatus = await prisma.status.create({
      data: {
        poster: newUser.name,
        userId: newUser.id,
        profilePicture: newUser?.avatar || null,
      },
    });
    // Generate JWT token after successful signup
    const token = await signToken(newUser.userId, newUser.email, res);

    // Return a response with the new user data and token (login the user immediately)
    return res.status(201).json({
      message: "Account created successfully and logged in",
      data: newUser,
      newStatus,
      token, // Send the token with the response
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
};
export const login = async (req, res) => {
  console.log(req.body);
  const { email, password, type, firstname, lastname, avatar } = req.body;

  try {
    if (!email)
      return res
        .status(400)
        .json({ error: "Please input a valid email address" });

    const userExists = await prisma.user.findFirst({
      where: { email },
      include: {
        groups: true,
      },
    });
    if (type == "passwordless") {
      // If the user does not exist, create a new user
      if (!userExists) {
        if (!firstname || !lastname)
          return res
            .status(400)
            .json({ error: "Firstname and lastname are required" });

        const newUser = await prisma.user.create({
          data: {
            name: `${firstname} ${lastname}`,
            avatar: avatar || null,
            email,
            theme: "system",
            status: "online",
            privacySettings: {
              showOnlineStatus: true,
              readReceipts: true,
              profileVisibility: "everyone",
            },
          },
        });
        console.log(newUser);
        const newStatus = await prisma.status.create({
          data: {
            poster: newUser.name,
            userId: newUser.id,
            profilePicture: newUser?.avatar || null,
          },
        });
        const token = await signToken(newUser.id, newUser.email, res);

        return res.status(201).json({
          message: "Account created and logged in successfully",
          data: newUser,
          newStatus,
          token,
        });
      }

      // If the user exists, simply sign a token
      const token = await signToken(userExists.id, userExists.email, res);
      return res.status(200).json({
        message: "Logged in successfully",
        data: userExists,
        token,
      });
    } else {
      // Handle the password-based login
      if (!userExists || !password) {
        return res.status(400).json({ error: "Invalid Credentials" });
      }

      const passwordMatches = await bcrypt.compare(
        password,
        userExists.password
      );
      console.log(passwordMatches);
      if (!passwordMatches)
        return res.status(401).json({ error: "Invalid Credentials" });

      const token = await signToken(userExists.id, userExists.email, res);
      return res
        .status(200)
        .json({ message: "Sign in successful", data: userExists, token });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const updateUser = async (req, res) => {
  const {
    firstName,
    lastName,
    bio,
    theme,
    status,
    receipts,
    visibility,
    password,
    twostep,
    avatar,
  } = req.body;
  const user = req.user;

  try {
    // Ensure at least one field is provided
    let newAvatar;
    let passwordToPush;
    if (avatar) {
      newAvatar = await uploadBase64(avatar, "images");
    }
    if (password) {
      passwordToPush = await bcrypt.hash(password, 12);
    }
    // Initialize updateData as an empty object
    let updateData = {
      // Add name if firstName or lastName is provided
      ...((firstName || lastName) && {
        name: `${firstName || user.name.split(" ")[0]} ${
          lastName || user.name.split(" ")[1]
        }`,
      }),
      ...(bio && { bio }),

      // Add avatar if newAvatar is provided
      ...(newAvatar && { avatar: newAvatar }),

      // Add theme if theme is provided
      ...(theme && { theme: theme }),

      // Add twoFactorEnabled if twostep is provided
      ...(twostep !== undefined && { twoFactorEnabled: twostep }),

      // Add password if passwordToPush is provided
      ...(passwordToPush && { password: passwordToPush }),

      // Add privacySettings if any of status, visibility, or receipts are provided
      ...((status !== undefined || visibility || receipts !== undefined) && {
        privacySettings: {
          readReceipts:
            receipts !== undefined
              ? receipts
              : user.privacySettings.readReceipts,
          showOnlineStatus:
            status !== undefined
              ? status
              : user.privacySettings.showOnlineStatus,
          profileVisibility:
            visibility !== undefined
              ? visibility
              : user.privacySettings.profileVisibility,
        },
      }),
    };

    // Update user in the database
    const updatedData = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
    const newStatusData = await prisma.status.update({
      where: { userId: user.id },
      data: {
        profilePicture: updatedData.avatar,
        poster: updateData.name,
      },
      include: {
        statuses: true,
      },
    });
    let processedUser = {
      ...updatedData,
      ...(updatedData.privacySettings.profileVisibility == "everyone"
        ? {
            avatar: updatedData.avatar,
          }
        : { avatar: null }),
    };

    io.to(getUserSocket(user.id)).emit("updatedProfile", {
      newProfile: updatedData,
      newStatusData,
    });
    io.to(getUserSocket(user.id)).emit("updatedStatus", newStatusData);
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
    idsToFind.forEach((id) => {
      io.to(getUserSocket(id)).emit("userUpdated", {
        updatedData: processedUser,
        newStatusData,
      });
    });
    // Return success response
    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "An error occurred, please try again" });
  }
};
export const getUser = async (req, res) => {
  const { email } = req.query;
  try {
    if (!email)
      return res.status(400).json({ error: "Email is a required field" });
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        avatar: true,
        name: true,
        blockedUsers: true,
        createdAt: true,
        email: true,
        id: true,
        location: true,
        password: false,
        phone: true,
        privacySettings: true,
      },
    });
    if (!user)
      return res
        .status(404)
        .json({ error: "User with this credential does not exist" });
    let processedUser = {
      ...user,
      ...(user.privacySettings.profileVisibility == "everyone"
        ? {
            avatar: user.avatar,
          }
        : { avatar: null }),
    };

    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ user: processedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const requestOtp = async (req, res) => {
  try {
    const { type } = req.body;
    const { email, name } = req.user;
    const userId = req.user.id;

    if (!type) {
      return res
        .status(400)
        .json({ error: "Type and email are required fields" });
    }

    // Check if OTP exists for this user and type, and if it has expired
    const otpExists = await prisma.otp.findFirst({
      where: { userId, type },
      orderBy: { createdAt: "desc" }, // Get the most recent OTP for this type
    });

    const now = new Date();
    const OTP_LIFESPAN = 30 * 60 * 1000; // 30 minutes in milliseconds

    if (otpExists) {
      // If OTP exists and hasn't expired, delete the old one
      await prisma.otp.delete({ where: { id: otpExists.id } });
    }

    const otp = generateNumbers(6);
    const otpNum = parseInt(otp.join(""), 10);

    const newOtp = await prisma.otp.create({
      data: {
        userId,
        otp: otpNum,
        type,
        expiresAt: new Date(now.getTime() + OTP_LIFESPAN),
      },
    });

    await sendOTPByEmail(email, name, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
export const verifyOtp = async (req, res) => {
  try {
    const { otp, type } = req.body;
    const userId = req.user.id;
    if (!otp || !type) {
      return res
        .status(400)
        .json({ error: "OTP and Type are required fields" });
    }

    // Fetch OTP data for the user and type, ordered by the most recent one
    const otpData = await prisma.otp.findFirst({
      where: { userId, type },
      orderBy: { createdAt: "desc" },
    });

    if (!otpData) {
      return res.status(400).json({ error: "Invalid OTP request" });
    }

    // Check if the OTP has expired
    const now = new Date();
    if (now > new Date(otpData.expiresAt)) {
      await prisma.otp.delete({ where: { id: otpData.id } });
      return res.status(401).json({ error: "OTP has expired" });
    }

    // Compare the OTPs
    if (parseInt(otpData.otp, 10) !== parseInt(otp, 10)) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    // If OTP is valid, delete the OTP record and return success
    await prisma.otp.delete({ where: { id: otpData.id } });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Deleting account with user ID:", userId);
    await prisma.$transaction(async (prisma) => {
      // Delete statuses
      await prisma.statusData.deleteMany({ where: { userId } });
      await prisma.status.deleteMany({ where: { userId } });

      // Delete messages
      await prisma.message.deleteMany({ where: { senderId: userId } });
      await prisma.groupMessage.deleteMany({ where: { senderId: userId } });

      // Delete conversations where user is a participant
      await prisma.conversation.deleteMany({
        where: {
          participantIds: {
            hasSome: [userId],
          },
        },
      });
      // Remove user from group admins
      const groupsWithUserAsAdmin = await prisma.groups.findMany({
        where: { admins: { has: userId } },
        select: { id: true, admins: true },
      });

      for (const group of groupsWithUserAsAdmin) {
        await prisma.groups.update({
          where: { id: group.id },
          data: {
            admins: {
              set: group.admins.filter((id) => id !== userId),
            },
          },
        });
      }
      const groupWithMembers = await prisma.groups.findMany({
        where: { members: { some: { id: userId } } },
      });
      // Remove user from group members
      /*  await prisma.groups.updateMany({
        where: { members: { some: { id: userId } } },
        data: {
          members,
        },
      });
 */
      groupWithMembers.forEach(async (group) => {
        await prisma.groups.update({
          where: { id: group.id },
          data: {
            members: {
              disconnect: {
                id: userId,
              },
            },
          },
        });
      });
      // Delete groups created by the user
      await prisma.groups.deleteMany({ where: { creator: userId } });

      // Delete OTPs linked to the user
      await prisma.otp.deleteMany({ where: { userId } });

      // Delete user account
      await prisma.user.delete({ where: { id: userId } });
    });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
