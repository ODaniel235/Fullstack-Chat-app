import express from "express";
import {
  createStatus,
  deleteStatus,
} from "../controllers/status.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const statusRouter = express.Router();
statusRouter.post("/new", authMiddleware, createStatus);
statusRouter.delete("/", authMiddleware, deleteStatus);
export default statusRouter;
