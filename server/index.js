require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware (runs on every request)
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "calma",
    time: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

function startServer() {
  app.listen(PORT, () => {
    console.log(`[calma] API server running on http://localhost:${PORT}`);
  });
}

if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log("[calma] MongoDB connected");
      startServer();
    })
    .catch((err) => {
      console.error("[calma] MongoDB connection failed:", err.message);
      process.exit(1);
    });
} else {
  console.warn("[calma] No MONGODB_URI in .env — starting without database.");
  startServer();
}

