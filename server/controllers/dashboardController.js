const Task = require("../models/Task");
const Habit = require("../models/Habit");
const Completion = require("../models/Completion");
const FocusSession = require("../models/FocusSession");

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

async function getSummary(req, res) {
  try {
    const userId = req.userId;
    const today = todayString();

    const startOfToday = new Date(today + "T00:00:00.000Z");
    const endOfToday = new Date(today + "T23:59:59.999Z");

    const [tasksCompletedToday, totalTasks, habitsDoneToday, totalHabits, focusSessionsToday] =
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
      ]);

    const tasksRemaining = totalTasks - tasksCompletedToday;

    return res.json({
      summary: {
        tasksCompletedToday,
        totalTasks,
        tasksRemaining,
        habitsDoneToday,
        totalHabits,
        focusSessionsToday,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load summary" });
  }
}

module.exports = { getSummary };
