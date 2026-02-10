const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const secret = process.env.JWT_SECRET;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Authorization header." });
  }
  if (!secret) {
    return res.status(500).json({ message: "Server misconfigured (missing JWT_SECRET)." });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, secret);
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

