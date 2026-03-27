import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../lib/api";
import { getToken, removeToken } from "../lib/auth";
import Layout from "../components/Layout";

const PRIORITY_BADGE = {
  high: "bg-amber-500/20 text-amber-400",
  normal: "bg-white/10 text-white/70",
  low: "bg-emerald-500/20 text-emerald-400",
};

const PRIORITY_LABEL = { high: "High", normal: "Normal", low: "Low" };

const emptySummary = {
  tasksCompletedToday: 0,
  totalTasks: 0,
  tasksRemaining: 0,
  habitsDoneToday: 0,
  totalHabits: 0,
  focusSessionsToday: 0,
  upNext: [],
};

function formatTodayLong() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDueHint(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate + "T12:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / (24 * 60 * 60 * 1000));
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Due today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function DashboardSkeleton() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3 animate-pulse">
          <div className="h-8 bg-white/10 rounded-lg max-w-md" />
          <div className="h-4 bg-white/5 rounded w-48" />
        </div>
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 min-w-[120px] h-[52px] bg-white/5 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryFailed, setSummaryFailed] = useState(false);
  const navigate = useNavigate();
  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    Promise.all([
      fetch(`${API_URL}/api/auth/me`, { headers }).then((res) => {
        if (!res.ok) throw new Error("Auth failed");
        return res.json();
      }),
      fetch(`${API_URL}/api/dashboard/summary`, { headers }).then((res) => {
        if (!res.ok) {
          setSummaryFailed(true);
          return null;
        }
        setSummaryFailed(false);
        return res.json();
      }),
    ])
      .then(([authData, summaryData]) => {
        setUser(authData?.user);
        setSummary(summaryData?.summary ?? null);
      })
      .catch(() => {
        removeToken();
        navigate("/", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning. What matters most today?";
    if (hour < 17) return "Good afternoon. Ready when you are.";
    return "Good evening. One thing at a time.";
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  const s = summary ?? emptySummary;
  const upNext = summaryFailed ? null : (s.upNext ?? []);
  const hasAnyActivity =
    s.tasksCompletedToday > 0 || s.habitsDoneToday > 0 || s.focusSessionsToday > 0;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-white/40 mb-2">
            {formatTodayLong()}
          </p>
          <h2 className="text-2xl font-semibold text-white mb-1">{getGreeting()}</h2>
          <p className="text-sm text-white/60">Signed in as {user?.email}</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            to="/tasks"
            className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white/90 font-medium hover:bg-white/10 transition-colors text-center"
          >
            Add task
          </Link>
          <Link
            to="/focus"
            className="flex-1 min-w-[120px] px-4 py-3 rounded-xl bg-amber-600/90 text-white font-medium hover:bg-amber-500/90 transition-colors text-center shadow-lg shadow-amber-500/20"
          >
            Start focus
          </Link>
          <Link
            to="/habits"
            className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white/90 font-medium hover:bg-white/10 transition-colors text-center"
          >
            Mark habit
          </Link>
        </div>

        <section aria-label="Today at a glance" className="mb-8">
          <h3 className="text-sm font-medium text-white/50 mb-3">Today</h3>
          {summaryFailed && (
            <p className="text-sm text-amber-400/90 mb-3">
              Could not refresh stats. Quick links and tasks below still work.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-2xl font-semibold text-white tabular-nums">
                {s.tasksCompletedToday}
                {s.totalTasks > 0 && (
                  <span className="text-white/50 font-normal text-base"> / {s.totalTasks}</span>
                )}
              </p>
              <p className="text-sm text-white/50">Tasks done today</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-2xl font-semibold text-white tabular-nums">
                {s.habitsDoneToday}
                {s.totalHabits > 0 && (
                  <span className="text-white/50 font-normal text-base"> / {s.totalHabits}</span>
                )}
              </p>
              <p className="text-sm text-white/50">Habits done today</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-2xl font-semibold text-white tabular-nums">{s.focusSessionsToday}</p>
              <p className="text-sm text-white/50">Focus sessions today</p>
            </div>
          </div>
          {!summaryFailed && !hasAnyActivity && s.totalTasks + s.totalHabits === 0 && (
            <p className="mt-4 text-sm text-white/45 max-w-lg">
              When you add tasks or habits, you will see progress here. No pressure—start with one small thing.
            </p>
          )}
          {!summaryFailed && !hasAnyActivity && s.totalTasks + s.totalHabits > 0 && (
            <p className="mt-4 text-sm text-white/45">You have not checked anything off yet today. Whenever you are ready.</p>
          )}
        </section>

        <section aria-label="Suggested next tasks">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h3 className="text-sm font-medium text-white/50">Up next</h3>
            <Link to="/tasks" className="text-xs text-amber-400/90 hover:text-amber-300 transition-colors">
              All tasks
            </Link>
          </div>
          {upNext === null ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
              <p className="text-white/55 text-sm mb-3">
                Could not load task suggestions. Your list is still on the Tasks page.
              </p>
              <Link
                to="/tasks"
                className="inline-flex px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/90 hover:bg-white/10 transition-colors"
              >
                Open tasks
              </Link>
            </div>
          ) : upNext.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
              <p className="text-white/65 text-sm mb-3">No open tasks. Nice and clear.</p>
              <Link
                to="/tasks"
                className="inline-flex px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/90 hover:bg-white/10 transition-colors"
              >
                Add a task
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {upNext.map((task) => {
                const dueHint = formatDueHint(task.dueDate);
                return (
                  <li key={task.id}>
                    <Link
                      to="/tasks"
                      className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/[0.08] transition-colors"
                    >
                      <span
                        className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.normal}`}
                      >
                        {PRIORITY_LABEL[task.priority] || "Normal"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white/90 group-hover:text-white truncate">
                          {task.title}
                        </p>
                        {dueHint && (
                          <p className="text-xs text-white/45 mt-0.5">{dueHint}</p>
                        )}
                      </div>
                      <span className="text-white/35 text-sm shrink-0" aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
}
