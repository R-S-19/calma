const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const requireAuth = require("./middleware/requireAuth");
const User = require("./models/User");

const app = express();

// Middleware (runs on every request)
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", requireAuth, taskRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "calma",
    time: new Date().toISOString(),
  });
});

// GET /api/auth/me (basic "who am I?" endpoint)
app.get("/api/auth/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("_id email");
  if (!user) return res.status(404).json({ message: "User not found." });
  return res.json({ user: { id: user._id, email: user.email } });
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

