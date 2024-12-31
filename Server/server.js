import { app, server } from "./src/socket/socket.js";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
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
const __dirname = path.resolve();
const PORT = 8080;
// Enable CORS for your frontend (localhost:8000)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}); /* 
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Client", "dist", "index.html"));
  });
}
 */
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
