import bcrypt from "bcryptjs";
import prisma from "../db/db.js";
import { signToken } from "../utils/utils.js";
export const signup = async (req, res) => {
  const { firstname, lastname, email, password, type, avatar, location } =
    req.body;
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
        newUser = userExists;
      } else {
        newUser = await prisma.user.create({
          data: {
            name: `${firstname} ${lastname}`,
            avatar:
              avatar ||
              "https://res.cloudinary.com/dvtuuqtdb/image/upload/v1719960554/images/ryjefb8seoqbaizc7fc3.jpg",
            email,
            theme: "system",
            status: "online",
            location,
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
          avatar:
            "https://res.cloudinary.com/dvtuuqtdb/image/upload/v1719960554/images/ryjefb8seoqbaizc7fc3.jpg",
          email,
          theme: "system",
          status: "online",
          location,
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
        profilePicture: newUser.avatar,
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
  const { email, password, type, firstname, lastname, avatar, location } =
    req.body;

  try {
    if (!email)
      return res
        .status(400)
        .json({ error: "Please input a valid email address" });

    const userExists = await prisma.user.findFirst({
      where: { email },
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
            avatar:
              avatar ||
              "https://res.cloudinary.com/dvtuuqtdb/image/upload/v1719960554/images/ryjefb8seoqbaizc7fc3.jpg",
            email,
            theme: "system",
            status: "online",
            location,
            privacySettings: {
              showOnlineStatus: true,
              readReceipts: true,
              profileVisibility: "everyone",
            },
          },
        });
        const newStatus = await prisma.status.create({
          data: {
            poster: newUser.name,
            userId: newUser.id,
            profilePicture: newUser.avatar,
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
