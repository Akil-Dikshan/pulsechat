import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { syncUser, searchUsers } from "../controllers/userController.js";

const router = express.Router();

router.post("/sync", authMiddleware, syncUser);
router.get("/search", authMiddleware, searchUsers);

export default router;