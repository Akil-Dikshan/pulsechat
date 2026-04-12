import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createRoom, getRooms } from "../controllers/roomController.js";

const router = express.Router();

router.post("/", authMiddleware, createRoom);
router.get("/", authMiddleware, getRooms);

export default router;