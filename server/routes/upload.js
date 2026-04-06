import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import { uploadFile } from "../controllers/uploadController.js";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only jpeg, png, gif, and pdf allowed."));
    }
  },
});

router.post("/", authMiddleware, upload.single("file"), uploadFile);

export default router;