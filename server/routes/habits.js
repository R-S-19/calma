const express = require("express");
const Habit = require("../models/Habit");
const Completion = require("../models/Completion");
const growthService = require("../services/growthService");

const router = express.Router();

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

// GET /api/habits — list habits for the user, with completedToday and completionDates for the month
router.get("/", async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    const today = todayString();
    const monthParam = req.query.month;
    const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam)
      ? monthParam
      : today.slice(0, 7);
    const [year, monthNum] = month.split("-").map(Number);
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);
    const startDate = firstDay.toISOString().slice(0, 10);
    const endDate = lastDay.toISOString().slice(0, 10);

    const [todayCompletions, monthCompletions] = await Promise.all([
      Completion.find({ userId: req.userId, date: today }).lean(),
      Completion.find({
        userId: req.userId,
        date: { $gte: startDate, $lte: endDate },
      }).lean(),
    ]);

    const completedIds = new Set(todayCompletions.map((c) => c.habitId.toString()));
    const completionByHabit = {};
    for (const c of monthCompletions) {
      const id = c.habitId.toString();
      if (!completionByHabit[id]) completionByHabit[id] = [];
      completionByHabit[id].push(c.date);
    }

    const habitsWithStatus = habits.map((h) => {
      const id = h._id.toString();
      return {
        ...h,
        completedToday: completedIds.has(id),
        completionDates: completionByHabit[id] || [],
      };
    });
    return res.json({ habits: habitsWithStatus, month });
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
    let leveledUpTraits = [];
    if (!completion) {
      completion = await Completion.create({
        habitId: habit._id,
        userId: req.userId,
        date: today,
      });
      const result = await growthService.applyAction(req.userId, "HABIT_7_DAY_STREAK", { habitId: habit._id });
      leveledUpTraits = result.leveledUpTraits || [];
    }
    return res.json({ completed: true, completion, leveledUpTraits });
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
