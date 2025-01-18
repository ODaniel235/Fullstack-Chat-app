import express from "express";
import { addToGroup, createGroup } from "../controllers/group.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const groupRouter = express.Router();
groupRouter.post("/create", authMiddleware, createGroup);
groupRouter.post("/join", authMiddleware, addToGroup);
export default groupRouter;
