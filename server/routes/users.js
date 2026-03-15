import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/sync", authMiddleware, async (req, res) => {
  try {
    const { asgardeoId, username, email, avatar } = req.body;

    if (!asgardeoId || !username || !email) {
      return res.status(400).json({ error: "asgardeoId, username, and email are required" });
    }

    const user = await User.findOneAndUpdate(
      { asgardeoId },
      {
        $set: {
          username,
          email,
          avatar: avatar || "",
        },
        $setOnInsert: {
          status: "offline",
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in /api/users/sync:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;