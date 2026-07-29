const rateLimit = require("express-rate-limit");

// Applies to login/register: 10 attempts per 15 minutes per IP.
// Generous enough for a real user who mistypes a password a few times,
// tight enough to blunt brute-force / credential-stuffing attempts.
const authLimiter =
  process.env.NODE_ENV === "test"
    ? (req, res, next) => next() // no-op in tests, so test suites aren't rate-limited
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: "Too many attempts. Please try again in a few minutes." },
      });

module.exports = { authLimiter };