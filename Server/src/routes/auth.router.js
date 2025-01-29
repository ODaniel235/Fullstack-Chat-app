import express from "express";
import {
  requestOtp,
  checkAuth,
  getUser,
  login,
  signup,
  updateUser,
  verifyOtp,
  deleteAccount,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const authRouter = express.Router();
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/check", authMiddleware, checkAuth);
authRouter.put("/", authMiddleware, updateUser);
authRouter.post("/otp", authMiddleware, requestOtp);
authRouter.post("/otp/verify", authMiddleware, verifyOtp);
authRouter.get("/", getUser);
authRouter.delete("/user", authMiddleware, deleteAccount);
export default authRouter;
