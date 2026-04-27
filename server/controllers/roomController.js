import Room from "../models/Room.js";
import User from "../models/User.js";

// POST /api/rooms
export const createRoom = async (req, res) => {
  try {
    const { name, participantIds } = req.body;

    if (!name || !participantIds || participantIds.length === 0) {
      return res.status(400).json({ error: "Name and participants are required" });
    }

    const admin = await User.findOne({ asgardeoId: req.user.sub });
    if (!admin) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find all participant users by their MongoDB _id
    const participants = await User.find({
      _id: { $in: participantIds },
    });

    if (participants.length === 0) {
      return res.status(404).json({ error: "No valid participants found" });
    }

    // Include admin in participants if not already there
    const allParticipantIds = [
      admin._id,
      ...participants
        .filter((p) => p._id.toString() !== admin._id.toString())
        .map((p) => p._id),
    ];

    const room = await Room.create({
      name,
      admin: admin._id,
      participants: allParticipantIds,
    });

    const populatedRoom = await Room.findById(room._id)
      .populate("participants", "username avatar asgardeoId")
      .populate("admin", "username avatar");

    res.status(201).json(populatedRoom);
  } catch (error) {
    console.error("Error in createRoom:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/rooms
export const getRooms = async (req, res) => {
  try {
    const me = await User.findOne({ asgardeoId: req.user.sub });
    if (!me) {
      return res.status(404).json({ error: "User not found" });
    }

    const rooms = await Room.find({
      participants: me._id,
    })
      .populate("participants", "username avatar asgardeoId")
      .populate("admin", "username avatar")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error in getRooms:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};