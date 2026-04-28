import User from "../models/User.js";

// POST /api/users/sync
export const syncUser = async (req, res) => {
  try {
    const { sub, username, email, picture, given_name, family_name, preferred_username } = req.user;

    // Build the best possible display name from available claims.
    // Priority: full name > preferred_username > username (if not an email) > email local-part
    let displayName;
    if (given_name || family_name) {
      displayName = `${given_name || ""} ${family_name || ""}`.trim();
    } else if (preferred_username && !preferred_username.includes("@")) {
      displayName = preferred_username;
    } else if (username && !username.includes("@")) {
      displayName = username;
    } else {
      // Fall back to the part before the @ in email
      displayName = (email || sub).split("@")[0];
    }

    const user = await User.findOneAndUpdate(
      { asgardeoId: sub },
      {
        $set: {
          username: displayName,
          email: email || "",
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
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email:    { $regex: q, $options: "i" } },
      ],
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