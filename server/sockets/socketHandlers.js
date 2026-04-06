import Message from "../models/Message.js";
import User from "../models/User.js";
import redis from "../utils/redisClient.js";

const userSocketMap = {};

export const getSocketId = (asgardeoId) => {
  return userSocketMap[asgardeoId];
};

const getConversationPartners = async (asgardeoId) => {
  const user = await User.findOne({ asgardeoId });
  if (!user) return [];

  const messages = await Message.find({
    $or: [{ sender: user._id }, { recipient: user._id }],
  }).select("sender recipient");

  const partnerIds = new Set();
  messages.forEach((msg) => {
    const senderId = msg.sender.toString();
    const recipientId = msg.recipient.toString();
    if (senderId !== user._id.toString()) partnerIds.add(senderId);
    if (recipientId !== user._id.toString()) partnerIds.add(recipientId);
  });

  const partners = await User.find({
    _id: { $in: Array.from(partnerIds) },
  }).select("asgardeoId");

  return partners.map((p) => p.asgardeoId);
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

    // Notify conversation partners that this user is online
    const partners = await getConversationPartners(sub);
    partners.forEach((partnerId) => {
      const partnerSocketId = getSocketId(partnerId);
      if (partnerSocketId) {
        io.to(partnerSocketId).emit("user_online", { userId: sub });
      }
    });
    // Send currently online partners to the newly connected user
    const onlinePartners = partners.filter((partnerId) => getSocketId(partnerId));
    socket.emit("online_users", { userIds: onlinePartners });

    socket.on("private_message", async ({ recipientId, content, type, fileName }) => {
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
          type: type || "text",
          fileUrl: type === "image" || type === "file" ? content : "",
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
    socket.on("typing_start", ({ recipientId }) => {
      const recipientSocketId = getSocketId(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("typing_start", { senderId: sub });
      }
    });

    socket.on("typing_stop", ({ recipientId }) => {
      const recipientSocketId = getSocketId(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("typing_stop", { senderId: sub });
      }
    });

    socket.on("mark_as_read", async ({ senderId }) => {
      try {
        const me = await User.findOne({ asgardeoId: sub });
        const sender = await User.findOne({ asgardeoId: senderId });

        if (!me || !sender) return;

        // Mark all unread messages from sender to me as read
        await Message.updateMany(
          {
            sender: sender._id,
            recipient: me._id,
            read: false,
          },
          { $set: { read: true } }
        );

        // Notify the sender that their messages were read
        const senderSocketId = getSocketId(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messages_read", { byUserId: sub });
        }
      } catch (error) {
        console.error("Error in mark_as_read:", error);
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

      // Notify conversation partners that this user is offline
      const partners = await getConversationPartners(sub);
      partners.forEach((partnerId) => {
        const partnerSocketId = getSocketId(partnerId);
        if (partnerSocketId) {
          io.to(partnerSocketId).emit("user_offline", { userId: sub });
        }
      });
    });
  });
};

export default initSocketHandlers;