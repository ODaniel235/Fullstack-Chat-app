import jwt from "jsonwebtoken";
import prisma from "../db/db.js";
const authMiddleware = async (req, res, next) => {
  try {
    const { RefreshToken, AccessToken } = req.cookies;
    if (!RefreshToken)
      return res
        .status(401)
        .json({ error: "Session expired, sign in to continue" });
    if (AccessToken) {
      const decoded = jwt.verify(AccessToken, process.env.JWT_SECRET);

      if (!decoded) return res.status(401).json({ error: "Unauthorized" });
      //Fetch user here
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
        },
      });
      req.user = user;
      next();
    } else {
      const decoded = jwt.verify(RefreshToken, process.env.JWT_SECRET);
      if (!decoded) return res.status(401).json({ error: "Unauthorized" });
      const accessToken = jwt.sign(
        {
          id: decoded.id,
          email: decoded.email,
        },
        process.env.JWTSECRET,
        { expiresIn: 60 * 1000 }
      );
      res.cookie("AccessToken", accessToken, {
        httpOnly: true,
        sameSite: "none",
        /*     secure: "true", */
        maxAge: 60 * 1000,
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
        },
      });
      req.user = user;
      next();
    }
  } catch (error) {
    res
      .status(403)
      .json({ error: "Session expired, please sign in to continue" });
  }
};
export default authMiddleware;
