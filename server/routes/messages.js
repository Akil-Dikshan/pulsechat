import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getConversations, getMessages, getRoomMessages } from "../controllers/messageController.js";

const router = express.Router();

// Must be before /:chatId to avoid being matched as a chat ID
router.get("/conversations", authMiddleware, getConversations);

router.get("/room/:roomId", authMiddleware, getRoomMessages);
router.get("/:chatId",      authMiddleware, getMessages);

export default router;
