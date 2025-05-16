import { app, server } from "./src/socket/socket.js";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import Cron from "node-cron";
import router from "./src/routes/router.js";
app.use(cookieParser());
dotenv.config();
const corsOptions = {
  origin: "http://localhost:5173", // Frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions)); // Add this BEFORE defining routes
app.options("*", cors(corsOptions)); // Preflight OPTIONS request handling

app.use(express.json({ limit: "50mb" }));

app.use("/api", router);

Cron.schedule(
  "*/30 * * * * *",
  async () => {
    const WEBSITE_URL =
      process.env.RENDER_URL ||
      `http://localhost:${process.env.PORT || PORT}/keep-alive`;
    try {
      const startTime = Date.now();
      const response = await fetch(WEBSITE_URL, {
        headers: { "User-Agent": "Keep-Alive" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      console.log(
        `[Keep-Alive] Visited ${WEBSITE_URL} and it is up and running`
      );
      console.log(`Time took to ping ${Date.now() - startTime}ms`);
    } catch (error) {
      console.log(error);
      console.error(`[Fatal-Error] : [Keep-Alive] Failed: ${error.message}`);
    }
  },
  { timezone: "UTC" }
);
const __dirname = path.resolve();
const PORT = 8080;
// Enable CORS for your frontend (localhost:8000)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Client", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
