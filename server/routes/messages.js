import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMessages, getRoomMessages } from "../controllers/messageController.js";

const router = express.Router();

router.get("/room/:roomId", authMiddleware, getRoomMessages);
router.get("/:chatId", authMiddleware, getMessages);

export default router;