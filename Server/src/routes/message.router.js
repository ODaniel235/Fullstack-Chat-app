import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
} from "../controllers/message.controller.js";
const messageRouter = express.Router();
messageRouter.post("/send", authMiddleware, sendMessage);
messageRouter.get("/:recipientId", authMiddleware, fetchMessages);
messageRouter.get("/", authMiddleware, fetchConversations);
export default messageRouter;
