const express = require("express");
const Task = require("../models/Task");
const growthService = require("../services/growthService");

const router = express.Router();

// All routes below require auth (middleware is added in index.js).

// GET /api/tasks — list tasks for the logged-in user
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ tasks });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// POST /api/tasks — create a task
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }
    const task = await Task.create({
      title: title.trim(),
      userId: req.userId,
    });
    return res.status(201).json({ task });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// PATCH /api/tasks/:id — toggle completed (or set it)
router.patch("/:id", async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found." });
    const wasCompleted = task.completed;
    task.completed = !task.completed;
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
