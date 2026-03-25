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
dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", usersRouter);
app.use("/api/messages", messagesRouter);

app.get("/", (req, res) => {
  res.json({ message: "PulseChat server is running" });
});

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