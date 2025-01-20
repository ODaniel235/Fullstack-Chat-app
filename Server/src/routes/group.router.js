import express from "express";
import {
  addToGroup,
  createGroup,
  fetchGroup,
  leaveGroup,
} from "../controllers/group.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const groupRouter = express.Router();
groupRouter.post("/create", authMiddleware, createGroup);
groupRouter.post("/join", authMiddleware, addToGroup);
groupRouter.get("/", authMiddleware, fetchGroup);
groupRouter.patch("/", authMiddleware, leaveGroup)
export default groupRouter;
