import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMessages } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:chatId", authMiddleware, getMessages);

export default router;