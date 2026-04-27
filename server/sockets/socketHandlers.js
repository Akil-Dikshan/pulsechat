import Room from "../models/Room.js";
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
    // Auto-join all Socket.io rooms the user belongs to
    const connectedUser = await User.findOne({ asgardeoId: sub });
    if (connectedUser) {
      const userRooms = await Room.find({ participants: connectedUser._id }).select("_id");
      userRooms.forEach((room) => {
        socket.join(room._id.toString());
        console.log(`User ${sub} joined room ${room._id}`);
      });
    }
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

    socket.on("join_room", async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        socket.join(roomId);

        // Notify other room members
        socket.to(roomId).emit("user_joined_room", {
          roomId,
          userId: sub,
        });

        console.log(`User ${sub} joined room ${roomId}`);
      } catch (error) {
        console.error("Error in join_room:", error);
      }
    });

    socket.on("room_message", async ({ roomId, content, type, fileName }) => {
      try {
        const sender = await User.findOne({ asgardeoId: sub });
        if (!sender) {
          return socket.emit("error", { message: "Sender not found" });
        }

        const room = await Room.findById(roomId);
        if (!room) {
          return socket.emit("error", { message: "Room not found" });
        }

        // Save message to MongoDB
        const message = await Message.create({
          sender: sender._id,
          room: roomId,
          content,
          type: type || "text",
          fileUrl: type === "image" || type === "file" ? content : "",
        });

        // Update room's lastMessage
        await Room.findByIdAndUpdate(roomId, { lastMessage: message._id });

        // Populate sender info
        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "username avatar")
          .populate("room", "name");

        // Emit to all sockets in the room
        io.to(roomId).emit("room_message", populatedMessage);
      } catch (error) {
        console.error("Error in room_message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("add_reaction", async ({ messageId, emoji }) => {
      try {
        const me = await User.findOne({ asgardeoId: sub });
        if (!me) return;

        const message = await Message.findById(messageId);
        if (!message) return;

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(
          (r) => r.user.toString() === me._id.toString() && r.emoji === emoji
        );

        if (existingReaction) {
          // Remove reaction (toggle off)
          await Message.findByIdAndUpdate(messageId, {
            $pull: { reactions: { user: me._id, emoji } },
          });
        } else {
          // Add reaction
          await Message.findByIdAndUpdate(messageId, {
            $push: { reactions: { user: me._id, emoji } },
          });
        }

        const updatedMessage = await Message.findById(messageId)
          .populate("sender", "username avatar")
          .populate("reactions.user", "username");

        // Emit to recipient or room
        if (updatedMessage.room) {
          io.to(updatedMessage.room.toString()).emit("reaction_updated", updatedMessage);
        } else {
          const recipientId = updatedMessage.recipient?.toString();
          const senderId = updatedMessage.sender._id.toString();

          const otherUserId = senderId === me._id.toString()
            ? await User.findById(recipientId).then(u => u?.asgardeoId)
            : await User.findById(senderId).then(u => u?.asgardeoId);

          const otherSocketId = getSocketId(otherUserId);
          if (otherSocketId) {
            io.to(otherSocketId).emit("reaction_updated", updatedMessage);
          }
          socket.emit("reaction_updated", updatedMessage);
        }
      } catch (error) {
        console.error("Error in add_reaction:", error);
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