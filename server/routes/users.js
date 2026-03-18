import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/users/sync
// Reads user info from req.user (set by authMiddleware via Asgardeo userinfo endpoint).
// Works for all login methods — email/password, Google, GitHub.
router.post("/sync", authMiddleware, async (req, res) => {
  try {
    const { sub, username, email, picture } = req.user;

    const user = await User.findOneAndUpdate(
      { asgardeoId: sub },
      {
        $set: {
          username: username || email || sub,
          email: email || username || "",
          avatar: picture || "",
        },
        $setOnInsert: {
          status: "offline",
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
      }
    );

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in /api/users/sync:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/search?q=username
// Returns users whose username matches the search query.
// Excludes the currently authenticated user from results.
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const users = await User.find({
      username: { $regex: q, $options: "i" },
      asgardeoId: { $ne: req.user.sub },
    })
      .select("username email avatar status lastSeen")
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in /api/users/search:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;