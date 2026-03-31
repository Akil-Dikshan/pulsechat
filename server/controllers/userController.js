import User from "../models/User.js";

// POST /api/users/sync
export const syncUser = async (req, res) => {
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
    console.error("Error in syncUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/users/search?q=username
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const users = await User.find({
      username: { $regex: q, $options: "i" },
      asgardeoId: { $ne: req.user.sub },
    })
      .select("username email avatar status lastSeen asgardeoId")
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUsers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};