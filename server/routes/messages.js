import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/messages/:chatId?page=1
// Returns 50 messages between the logged-in user and chatId user.
// chatId is the other user's MongoDB _id.
router.get("/:chatId", authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    // Find the logged-in user's MongoDB document
    const me = await User.findOne({ asgardeoId: req.user.sub });

    if (!me) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find messages between the two users in either direction
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

    // Return in chronological order (oldest first)
    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error("Error in GET /api/messages/:chatId", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;