import Message from "../models/Message.js";
import User from "../models/User.js";
import redis from "../utils/redisClient.js";

const userSocketMap = {};

export const getSocketId = (asgardeoId) => {
  return userSocketMap[asgardeoId];
};

const initSocketHandlers = (io) => {
  io.on("connection", async (socket) => {
    const { sub, username } = socket.user;

    console.log(`User connected: ${username || sub} (socket: ${socket.id})`);

    // Add to in-memory map
    userSocketMap[sub] = socket.id;
    console.log("Online users:", Object.keys(userSocketMap).length);

    // Mark as online in Redis
    await redis.set(`online:${sub}`, "true");

    socket.on("private_message", async ({ recipientId, content }) => {
      try {
        const sender = await User.findOne({ asgardeoId: sub });

        if (!sender) {
          return socket.emit("error", { message: "Sender not found" });
        }

        const recipient = await User.findOne({ asgardeoId: recipientId });

        if (!recipient) {
          return socket.emit("error", { message: "Recipient not found" });
        }

        const message = await Message.create({
          sender: sender._id,
          recipient: recipient._id,
          content,
          type: "text",
        });

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "username avatar")
          .populate("recipient", "username avatar");

        const recipientSocketId = getSocketId(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("private_message", populatedMessage);
        }

        socket.emit("message_sent", populatedMessage);
      } catch (error) {
        console.error("Error in private_message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${username || sub} (socket: ${socket.id})`);

      // Remove from in-memory map
      delete userSocketMap[sub];
      console.log("Online users:", Object.keys(userSocketMap).length);

      // Remove from Redis
      await redis.del(`online:${sub}`);

      // Update lastSeen in MongoDB
      await User.findOneAndUpdate(
        { asgardeoId: sub },
        { lastSeen: new Date(), status: "offline" }
      );
    });
  });
};

export default initSocketHandlers;