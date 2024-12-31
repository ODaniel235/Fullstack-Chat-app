import express from "express";
import { checkAuth, login, signup } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const authRouter = express.Router();
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/check", authMiddleware, checkAuth);
export default authRouter;
