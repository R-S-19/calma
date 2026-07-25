const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const habitRoutes = require("./routes/habits");
const dashboardRoutes = require("./routes/dashboard");
const focusRoutes = require("./routes/focus");
const requireAuth = require("./middleware/requireAuth");
const User = require("./models/User");

const app = express();


// Trust the first proxy hop (needed on Render/Railway/Heroku-style platforms
// so express-rate-limit sees the real client IP, not the proxy's IP).
app.set("trust proxy", 1);

// Middleware (runs on every request)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", requireAuth, taskRoutes);
app.use("/api/habits", requireAuth, habitRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/focus", requireAuth, focusRoutes);

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

