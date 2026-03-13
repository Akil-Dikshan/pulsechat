import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import usersRouter from "./routes/users.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", usersRouter);

app.get("/", (req, res) => {
  res.json({ message: "PulseChat server is running" });
});

// Connect to MongoDB then start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });