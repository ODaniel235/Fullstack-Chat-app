import express from "express";
import {
  createStatus,
  deleteStatus,
  fetchStatuses,
} from "../controllers/status.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const statusRouter = express.Router();
statusRouter.post("/new", authMiddleware, createStatus);
statusRouter.delete("/", authMiddleware, deleteStatus);
statusRouter.get("/", authMiddleware, fetchStatuses);
export default statusRouter;
