const express = require("express");
const Habit = require("../models/Habit");
const Completion = require("../models/Completion");

const router = express.Router();

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

// GET /api/habits — list habits for the user, with completedToday
router.get("/", async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    const today = todayString();
    const completions = await Completion.find({
      userId: req.userId,
      date: today,
    }).lean();
    const completedIds = new Set(completions.map((c) => c.habitId.toString()));
    const habitsWithStatus = habits.map((h) => ({
      ...h,
      completedToday: completedIds.has(h._id.toString()),
    }));
    return res.json({ habits: habitsWithStatus });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// POST /api/habits — create a habit
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Name is required." });
    }
    const habit = await Habit.create({
      name: name.trim(),
      userId: req.userId,
    });
    return res.status(201).json({ habit: { ...habit.toObject(), completedToday: false } });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// POST /api/habits/:id/complete — mark habit done for today (idempotent)
router.post("/:id/complete", async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
    if (!habit) return res.status(404).json({ message: "Habit not found." });
    const today = todayString();
    let completion = await Completion.findOne({ habitId: habit._id, date: today });
    if (!completion) {
      completion = await Completion.create({
        habitId: habit._id,
        userId: req.userId,
        date: today,
      });
    }
    return res.json({ completed: true, completion });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// DELETE /api/habits/:id/complete — remove today's completion (undo)
router.delete("/:id/complete", async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
    if (!habit) return res.status(404).json({ message: "Habit not found." });
    const today = todayString();
    await Completion.findOneAndDelete({ habitId: habit._id, date: today });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// DELETE /api/habits/:id
router.delete("/:id", async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!habit) return res.status(404).json({ message: "Habit not found." });
    await Completion.deleteMany({ habitId: habit._id });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
