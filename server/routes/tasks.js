const express = require("express");
const Task = require("../models/Task");
const growthService = require("../services/growthService");

const router = express.Router();

const PRIORITY_ORDER = { high: 0, normal: 1, low: 2 };

// GET /api/tasks — list tasks for the logged-in user
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();
    tasks.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.completed) return new Date(b.completedAt || 0) - new Date(a.completedAt || 0);
      const pa = PRIORITY_ORDER[a.priority] ?? 1;
      const pb = PRIORITY_ORDER[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return res.json({ tasks });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// POST /api/tasks — create a task
router.post("/", async (req, res) => {
  try {
    const { title, priority } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }
    const validPriority = ["high", "normal", "low"].includes(priority) ? priority : "normal";
    const task = await Task.create({
      title: title.trim(),
      priority: validPriority,
      userId: req.userId,
    });
    return res.status(201).json({ task });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// PATCH /api/tasks/:id — toggle completed or update priority
router.patch("/:id", async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found." });

    if (req.body?.priority !== undefined) {
      const validPriority = ["high", "normal", "low"].includes(req.body.priority)
        ? req.body.priority
        : "normal";
      task.priority = validPriority;
      await task.save();
      return res.json({ task });
    }

    const wasCompleted = task.completed;
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();
    let leveledUpTraits = [];
    if (!wasCompleted && task.completed) {
      const result = await growthService.applyAction(req.userId, "TASK_COMPLETE", {});
      leveledUpTraits = result.leveledUpTraits || [];
    }
    return res.json({ task, leveledUpTraits });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// DELETE /api/tasks/completed — clear all completed tasks
router.delete("/completed", async (req, res) => {
  try {
    const result = await Task.deleteMany({ userId: req.userId, completed: true });
    return res.json({ deleted: result.deletedCount });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!result) return res.status(404).json({ message: "Task not found." });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
