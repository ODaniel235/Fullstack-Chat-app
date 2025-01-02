import express from "express";
import {
  checkAuth,
  getUser,
  login,
  signup,
  updateUser,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const authRouter = express.Router();
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/check", authMiddleware, checkAuth);
authRouter.put("/", authMiddleware, updateUser);
authRouter.get("/", getUser);
export default authRouter;
