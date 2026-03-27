const Task = require("../models/Task");
const Habit = require("../models/Habit");
const Completion = require("../models/Completion");
const FocusSession = require("../models/FocusSession");

const PRIORITY_RANK = { high: 0, normal: 1, low: 2 };

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function pickUpNextTasks(raw) {
  const sorted = [...raw].sort((a, b) => {
    const pa = PRIORITY_RANK[a.priority] ?? 1;
    const pb = PRIORITY_RANK[b.priority] ?? 1;
    if (pa !== pb) return pa - pb;
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  return sorted.slice(0, 3).map((t) => ({
    id: String(t._id),
    title: t.title,
    priority: t.priority,
    dueDate: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : null,
  }));
}

async function getSummary(req, res) {
  try {
    const userId = req.userId;
    const today = todayString();

    const startOfToday = new Date(today + "T00:00:00.000Z");
    const endOfToday = new Date(today + "T23:59:59.999Z");

    const [tasksCompletedToday, totalTasks, habitsDoneToday, totalHabits, focusSessionsToday, openTasks] =
      await Promise.all([
        Task.countDocuments({
          userId,
          completed: true,
          completedAt: { $gte: startOfToday, $lte: endOfToday },
        }),
        Task.countDocuments({ userId }),
        Completion.countDocuments({ userId, date: today }),
        Habit.countDocuments({ userId }),
        FocusSession.countDocuments({ userId, date: today }),
        Task.find({ userId, completed: false }).select("title priority dueDate").lean().limit(24),
      ]);

    const tasksRemaining = totalTasks - tasksCompletedToday;
    const upNext = pickUpNextTasks(openTasks);

    return res.json({
      summary: {
        tasksCompletedToday,
        totalTasks,
        tasksRemaining,
        habitsDoneToday,
        totalHabits,
        focusSessionsToday,
        upNext,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load summary" });
  }
}

module.exports = { getSummary };
