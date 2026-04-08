const express = require("express");
const mongoose = require("mongoose");
const FocusSession = require("../models/FocusSession");
const Task = require("../models/Task");

const router = express.Router();

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

// POST /api/focus/session — record a completed focus session (for dashboard count)
// body.taskId optional: must be an open task owned by the user
router.post("/session", async (req, res) => {
  try {
    const today = todayString();
    const { taskId } = req.body || {};

    let linkedTaskId = null;
    if (taskId && mongoose.Types.ObjectId.isValid(taskId)) {
      const task = await Task.findOne({
        _id: taskId,
        userId: req.userId,
        completed: false,
      })
        .select("_id")
        .lean();
      if (task) linkedTaskId = task._id;
    }

    await FocusSession.create({
      userId: req.userId,
      date: today,
      taskId: linkedTaskId,
    });
    return res.status(201).json({ recorded: true });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
