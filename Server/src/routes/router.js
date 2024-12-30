//router.js
import express from "express";
import authRouter from "./auth.router.js";
import messageRouter from "./message.router.js";
import statusRouter from "./status.router.js";
const router = express.Router();
router.use("/auth", authRouter);
router.use("/message", messageRouter);
router.use("/status", statusRouter);
export default router;
