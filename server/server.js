import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import usersRouter from "./routes/users.js";
import socketAuthMiddleware from "./middleware/socketAuthMiddleware.js";
import initSocketHandlers from "./sockets/socketHandlers.js";
import messagesRouter from "./routes/messages.js";
import "./utils/redisClient.js";
import uploadRouter from "./routes/upload.js";
import roomsRouter from "./routes/rooms.js";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://pulsechat-beta.vercel.app",
      process.env.CLIENT_URL,
    ].filter(Boolean),
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://pulsechat-beta.vercel.app",
    process.env.CLIENT_URL,
  ].filter(Boolean),
}));
app.use(express.json());

// Routes
app.use("/api/users", usersRouter);
app.use("/api/messages", messagesRouter);

app.get("/", (req, res) => {
  res.json({ message: "PulseChat server is running" });
});
app.use("/api/upload", uploadRouter);
app.use("/api/rooms", roomsRouter);
// Socket.io
io.use(socketAuthMiddleware);
initSocketHandlers(io);

// Connect to MongoDB then start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

export { io };