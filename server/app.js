const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const habitRoutes = require("./routes/habits");
const dashboardRoutes = require("./routes/dashboard");
const focusRoutes = require("./routes/focus");
const requireAuth = require("./middleware/requireAuth");
const User = require("./models/User");

const app = express();

app.set("trust proxy", 2);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", requireAuth, taskRoutes);
app.use("/api/habits", requireAuth, habitRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/focus", requireAuth, focusRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "calma",
    time: new Date().toISOString(),
  });
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("_id email");
  if (!user) return res.status(404).json({ message: "User not found." });
  return res.json({ user: { id: user._id, email: user.email } });
});

module.exports = app;