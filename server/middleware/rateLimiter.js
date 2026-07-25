const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ message: "Too many attempts. Please try again in a few minutes." });
  },
  message: { message: "Too many attempts. Please try again in a few minutes." },
  keyGenerator: (req, res) => {
    console.log("🔑 rate limit key (req.ip):", req.ip, "| X-Forwarded-For:", req.headers["x-forwarded-for"]);
    return req.ip;
  },
});

module.exports = { authLimiter };