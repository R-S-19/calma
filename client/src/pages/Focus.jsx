import { useState, useEffect } from "react";
import { useFocusTimer } from "../context/FocusTimerContext";
import Layout from "../components/Layout";
import { API_URL } from "../lib/api";
import { getToken } from "../lib/auth";

const PRESETS = [
  { label: "25 min", seconds: 25 * 60 },
  { label: "15 min", seconds: 15 * 60 },
  { label: "5 min", seconds: 5 * 60 },
];

const PRIORITY_ORDER = { high: 0, normal: 1, low: 2 };

export default function Focus() {
  const [openTasks, setOpenTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const {
    timeRemaining,
    isRunning,
    timesUp,
    focusedTask,
    setFocusedTask,
    start,
    pause,
    reset,
    selectPreset,
    formatTime,
  } = useFocusTimer();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setTasksLoading(false);
      return;
    }
    fetch(`${API_URL}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : { tasks: [] }))
      .then((data) => {
        const open = (data.tasks || [])
          .filter((t) => !t.completed)
          .sort((a, b) => {
            const pa = PRIORITY_ORDER[a.priority] ?? 1;
            const pb = PRIORITY_ORDER[b.priority] ?? 1;
            if (pa !== pb) return pa - pb;
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          });
        setOpenTasks(open);
      })
      .catch(() => setOpenTasks([]))
      .finally(() => setTasksLoading(false));
  }, []);

  useEffect(() => {
    if (tasksLoading) return;
    setFocusedTask((prev) => {
      if (!prev) return prev;
      return openTasks.some((t) => t._id === prev._id) ? prev : null;
    });
  }, [openTasks, tasksLoading, setFocusedTask]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-app mb-6">Focus timer</h2>

        <div className="mb-8 rounded-xl border border-app bg-app-surface px-4 py-3">
          <label htmlFor="focus-task" className="block text-sm font-medium text-app-secondary mb-2">
            Working on
          </label>
          <select
            id="focus-task"
            value={focusedTask?._id ?? ""}
            onChange={(e) => {
              const id = e.target.value;
              const t = openTasks.find((x) => x._id === id);
              setFocusedTask(t ? { _id: t._id, title: t.title } : null);
            }}
            disabled={isRunning}
            className="w-full max-w-xl rounded-xl border border-app bg-app-input px-3 py-2.5 text-app-secondary text-sm focus:outline-none focus:ring-2 focus:ring-[var(--app-ring)] disabled:opacity-60"
          >
            <option value="">Free focus — no task linked</option>
            {tasksLoading && <option disabled>Loading tasks…</option>}
            {!tasksLoading &&
              openTasks.map((t) => (
                <option key={t._id} value={t._id} className="bg-[var(--app-select-option-bg)] text-[var(--app-select-option-text)]">
                  {t.title}
                </option>
              ))}
          </select>
          <p className="text-xs text-app-subtle mt-2">
            Completed sessions are counted on the dashboard. If you pick a task, the session is linked to it for your records.
          </p>
        </div>

        <div className="flex gap-2 mb-8">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => selectPreset(p.seconds)}
              disabled={isRunning}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${
                timeRemaining === p.seconds && !isRunning
                  ? "bg-amber-600/90 text-white shadow-lg shadow-amber-500/20"
                  : "border border-app bg-app-surface text-app-muted hover:bg-[var(--app-surface-hover)] disabled:opacity-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-app bg-app-surface backdrop-blur-xl p-8 md:p-12 text-center shadow-app-timer">
          {focusedTask && (
            <p className="text-sm text-app-muted mb-4 truncate max-w-md mx-auto" title={focusedTask.title}>
              {focusedTask.title}
            </p>
          )}
          <p
            className={`text-5xl md:text-6xl font-mono font-medium mb-6 ${
              timesUp ? "text-amber-600 dark:text-amber-400" : "text-app"
            }`}
          >
            {formatTime(timeRemaining)}
          </p>
          {timesUp && (
            <p className="text-amber-700 dark:text-amber-400 font-medium mb-6">Time's up. Nice focus.</p>
          )}
          <div className="flex justify-center gap-3 flex-wrap">
            {!isRunning && timeRemaining > 0 && (
              <button
                type="button"
                onClick={start}
                className="px-6 py-3 rounded-xl bg-amber-600/90 hover:bg-amber-500/90 text-white font-medium transition-all shadow-lg shadow-amber-500/20"
              >
                Start
              </button>
            )}
            {isRunning && (
              <button
                type="button"
                onClick={pause}
                className="px-6 py-3 rounded-xl border border-app bg-app-surface text-app hover:bg-[var(--app-surface-hover)] transition-all"
              >
                Pause
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              className="px-6 py-3 rounded-xl border border-app bg-app-surface text-app-secondary hover:bg-[var(--app-surface-hover)] transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
