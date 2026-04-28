import Message from "../models/Message.js";
import User from "../models/User.js";

// GET /api/messages/conversations
// Returns one entry per DM partner: { user, lastMessage, unreadCount }
export const getConversations = async (req, res) => {
  try {
    const me = await User.findOne({ asgardeoId: req.user.sub });
    if (!me) return res.status(404).json({ error: "User not found" });

    // All DM messages involving the current user, newest first
    const messages = await Message.find({
      $or: [
        { sender: me._id, recipient: { $exists: true, $ne: null } },
        { recipient: me._id },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("sender",    "username email asgardeoId avatar lastSeen status")
      .populate("recipient", "username email asgardeoId avatar lastSeen status");

    // Deduplicate — keep only the most recent message per partner
    const seen = new Map();
    for (const msg of messages) {
      if (!msg.sender || !msg.recipient) continue;
      const partner =
        msg.sender._id.toString() === me._id.toString()
          ? msg.recipient
          : msg.sender;
      if (!seen.has(partner._id.toString())) {
        seen.set(partner._id.toString(), { user: partner, lastMessage: msg });
      }
    }

    // Count unread messages per partner (messages sent TO me that are unread)
    const unreadAgg = await Message.aggregate([
      { $match: { recipient: me._id, read: false } },
      { $group: { _id: "$sender", count: { $sum: 1 } } },
    ]);
    const unreadMap = {};
    unreadAgg.forEach(({ _id, count }) => { unreadMap[_id.toString()] = count; });

    const conversations = Array.from(seen.values()).map(({ user, lastMessage }) => ({
      user,
      lastMessage: {
        content: lastMessage.content,
        type:    lastMessage.type,
        createdAt: lastMessage.createdAt,
        isMine: lastMessage.sender._id.toString() === me._id.toString(),
      },
      unreadCount: unreadMap[user._id.toString()] || 0,
    }));

    res.json(conversations);
  } catch (error) {
    console.error("getConversations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/messages/:chatId?page=1
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const me = await User.findOne({ asgardeoId: req.user.sub });

    if (!me) {
      return res.status(404).json({ error: "User not found" });
    }

    const messages = await Message.find({
      $or: [
        { sender: me._id, recipient: chatId },
        { sender: chatId, recipient: me._id },
      ],
    })
      .populate("sender", "username avatar")
      .populate("recipient", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// GET /api/messages/room/:roomId?page=1
export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ room: roomId })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error("Error in getRoomMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};