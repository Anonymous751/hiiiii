// ==============================
// Core Imports
// ==============================
import express from "express";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";

// ==============================
// Local Imports
// ==============================
import usersRouter from "./routes/users.js";
import filesRouter from "./routes/files.js";
import connectDB from "./config/db/db.connect.js";

// ==============================
// Setup
// ==============================
dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ==============================
// Database Connection
// ==============================
const DATABASE_URI = process.env.DATABASE_URI;
connectDB(DATABASE_URI);

// ==============================
// Middlewares
// ==============================
app.use(
  cors({
    origin: "http://localhost:5173", // frontend
    credentials: true,
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ==============================
// Static Files (for file downloads)
// ==============================
app.use("/files", filesRouter);

// ==============================
// Routes
// ==============================
app.use("/users", usersRouter);

// ==============================
// Error Handling
// ==============================

// 404 handler
app.use((req, res, next) => {
  next(createError(404));
});

// Global error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

// ==============================
// Start Server (after MongoDB ready)
// ==============================
mongoose.connection.once("open", () => {
  console.log("✅ MongoDB Connected");
  app.listen(3000, () => console.log("🚀 Server running on port 3000"));
});

export default app;
