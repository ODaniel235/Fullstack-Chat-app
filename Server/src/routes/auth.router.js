import express from "express";
import {
  checkAuth,
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
export default authRouter;
