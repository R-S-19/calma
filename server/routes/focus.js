const express = require("express");
const FocusSession = require("../models/FocusSession");

const router = express.Router();

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

// POST /api/focus/session — record a completed focus session (for dashboard count)
router.post("/session", async (req, res) => {
  try {
    const today = todayString();
    await FocusSession.create({
      userId: req.userId,
      date: today,
    });
    return res.status(201).json({ recorded: true });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
