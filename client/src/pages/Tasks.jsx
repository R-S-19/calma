import { useState, useEffect } from "react";
import { API_URL } from "../lib/api";
import { getToken } from "../lib/auth";
import { useLevelUpToast } from "../context/LevelUpToastContext";
import Layout from "../components/Layout";

const PRIORITIES = [
  { value: "high", label: "High", badge: "bg-amber-500/20 text-amber-400", order: 0 },
  { value: "normal", label: "Normal", badge: "bg-white/10 text-white/70", order: 1 },
  { value: "low", label: "Low", badge: "bg-emerald-500/20 text-emerald-400", order: 2 },
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return "Today";
  const isYesterday = (() => {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return d.getDate() === y.getDate() && d.getMonth() === y.getMonth() && d.getFullYear() === y.getFullYear();
  })();
  if (isYesterday) return "Yesterday";
  const sameYear = d.getFullYear() === today.getFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function formatDueDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((d - today) / (24 * 60 * 60 * 1000));
  if (diff < 0) return `Overdue (${formatDate(dateStr)})`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `Due ${formatDate(dateStr)}`;
}

function toDateInputValue(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 10);
}

function CalendarIcon({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function NotesIcon({ className }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const { showLevelUp } = useLevelUpToast();
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [newPriority, setNewPriority] = useState("normal");
  const [newDueDate, setNewDueDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [editingNotes, setEditingNotes] = useState(null);
  const [editingDueDate, setEditingDueDate] = useState(null);

  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };

  function fetchTasks() {
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/tasks`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load tasks");
        return res.json();
      })
      .then((data) => setTasks(data.tasks || []))
      .catch(() => setError("Could not load tasks"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          priority: newPriority,
          dueDate: newDueDate || null,
          notes: newNotes.trim() || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add task");
      setTasks((prev) => [data.task, ...prev]);
      setNewTitle("");
      setNewPriority("normal");
      setNewDueDate("");
      setNewNotes("");
    } catch (err) {
      setError(err.message || "Could not add task");
    } finally {
      setSubmitting(false);
    }
  }

  function handleToggle(id) {
    fetch(`${API_URL}/api/tasks/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      })
      .then((data) => {
        setTasks((prev) =>
          prev.map((t) => (t._id === data.task._id ? data.task : t))
        );
        if (data.leveledUpTraits?.length) showLevelUp(data.leveledUpTraits);
      })
      .catch(() => setError("Could not update task"));
  }

  function handlePriorityChange(id, nextPriority) {
    fetch(`${API_URL}/api/tasks/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ priority: nextPriority }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      })
      .then((data) => {
        setTasks((prev) =>
          prev.map((t) => (t._id === data.task._id ? data.task : t))
        );
      })
      .catch(() => setError("Could not update priority"));
  }

  function handleDueDateChange(id, dueDate) {
    fetch(`${API_URL}/api/tasks/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate: dueDate || null }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      })
      .then((data) => {
        setTasks((prev) =>
          prev.map((t) => (t._id === data.task._id ? data.task : t))
        );
      })
      .catch(() => setError("Could not update due date"));
  }

  function handleNotesChange(id, notes) {
    setEditingNotes(null);
    fetch(`${API_URL}/api/tasks/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notes || "" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      })
      .then((data) => {
        setTasks((prev) =>
          prev.map((t) => (t._id === data.task._id ? data.task : t))
        );
      })
      .catch(() => setError("Could not update notes"));
  }

  function handleDelete(id) {
    fetch(`${API_URL}/api/tasks/${id}`, { method: "DELETE", headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        setTasks((prev) => prev.filter((t) => t._id !== id));
      })
      .catch(() => setError("Could not delete task"));
  }

  async function handleClearCompleted() {
    try {
      const res = await fetch(`${API_URL}/api/tasks/completed`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Failed to clear");
      setTasks((prev) => prev.filter((t) => !t.completed));
    } catch {
      setError("Could not clear completed tasks");
    }
  }

  const incomplete = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      const pa = PRIORITIES.find((p) => p.value === (a.priority || "normal"))?.order ?? 1;
      const pb = PRIORITIES.find((p) => p.value === (b.priority || "normal"))?.order ?? 1;
      if (pa !== pb) return pa - pb;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  const completed = [...tasks.filter((t) => t.completed)].sort(
    (a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0)
  );

  return (
    <Layout>
      <div className="min-h-screen relative overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,165,116,0.12),transparent_60%)] blur-3xl opacity-50 pointer-events-none"
          aria-hidden
        />

        <div className="relative flex flex-col items-center px-4 py-12 md:py-16 max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <h2 className="text-4xl font-semibold tracking-tight text-white">
              Tasks
            </h2>
            <p className="text-white/60 mt-2">One thing at a time.</p>
          </header>

          <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(212,165,116,0.06)] p-6 md:p-8">
            <form onSubmit={handleAdd} className="space-y-3 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What do you need to do?"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-transparent transition-all"
                  disabled={submitting}
                />
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 focus:outline-none focus:ring-2 focus:ring-amber-400/40 sm:w-40 [color-scheme:dark]"
                  disabled={submitting}
                />
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 focus:outline-none focus:ring-2 focus:ring-amber-400/40 sm:w-28"
                  disabled={submitting}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value} className="bg-[#0F1219] text-white">
                      {p.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={submitting || !newTitle.trim()}
                  className="bg-amber-600/90 hover:bg-amber-500/90 text-white rounded-xl px-5 py-3 font-medium transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Notes (optional)"
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-transparent transition-all resize-none"
                disabled={submitting}
              />
            </form>

            {error && (
              <p className="text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-6">
                {error}
              </p>
            )}

            {loading ? (
              <p className="text-white/50 py-8 text-center">Loading tasks…</p>
            ) : tasks.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-white/60 text-lg mb-2">Nothing on your list yet.</p>
                <p className="text-white/40 text-sm">
                  Add a task above when you're ready. One step at a time.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="text-white/50 w-4 h-4" />
                    <span className="text-white font-medium">Today</span>
                  </div>
                  <span className="text-white/50 text-sm">
                    {incomplete.length} task{incomplete.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="border-t border-white/10 my-6" />

                <ul className="space-y-3">
                  {incomplete.map((task, index) => (
                    <li
                      key={task._id}
                      className={`group flex justify-between items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all ${
                        index === 0 ? "border-l-4 border-l-amber-400/80 shadow-[0_0_20px_rgba(212,165,116,0.08)]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleToggle(task._id)}
                          className="rounded border-white/30 bg-white/5 w-5 h-5 text-amber-500 focus:ring-amber-400/40 focus:ring-offset-0 accent-amber-500"
                        />
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${
                            PRIORITIES.find((p) => p.value === (task.priority || "normal"))?.badge ?? "bg-white/10 text-white/70"
                          }`}
                        >
                          {PRIORITIES.find((p) => p.value === (task.priority || "normal"))?.label ?? "Normal"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-medium">{task.title}</span>
                            {index === 0 && (
                              <span className="text-amber-400/90 text-xs font-medium">Today's Mission</span>
                            )}
                            {task.dueDate && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  new Date(task.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
                                    ? "bg-amber-500/30 text-amber-400"
                                    : "bg-white/10 text-white/60"
                                }`}
                              >
                                {formatDueDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-xs text-white/40">
                            {task.createdAt && (
                              <span>Added {formatDate(task.createdAt)}</span>
                            )}
                            {(task.dueDate || editingDueDate === task._id) ? (
                              <>
                                {task.createdAt && <span>·</span>}
                                {editingDueDate === task._id ? (
                                  <input
                                    type="date"
                                    defaultValue={toDateInputValue(task.dueDate)}
                                    onBlur={(e) => {
                                      const val = e.target.value || null;
                                      if (val) handleDueDateChange(task._id, val);
                                      setEditingDueDate(null);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        const val = e.target.value || null;
                                        if (val) handleDueDateChange(task._id, val);
                                        setEditingDueDate(null);
                                      }
                                      if (e.key === "Escape") setEditingDueDate(null);
                                    }}
                                    autoFocus
                                    className="bg-white/10 border border-white/20 rounded px-1 py-0.5 text-white/80 text-xs [color-scheme:dark]"
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setEditingDueDate(task._id)}
                                    className="text-left hover:text-white/60"
                                  >
                                    {formatDueDate(task.dueDate)}
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                {task.createdAt && <span>·</span>}
                                <button
                                  type="button"
                                  onClick={() => setEditingDueDate(task._id)}
                                  className="text-white/30 hover:text-white/50"
                                >
                                  Add date
                                </button>
                              </>
                            )}
                          </div>
                          {editingNotes === task._id ? (
                            <div className="mt-2">
                              <textarea
                                defaultValue={task.notes || ""}
                                onBlur={(e) => handleNotesChange(task._id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Escape") setEditingNotes(null);
                                }}
                                autoFocus
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-amber-400/40 resize-none"
                              />
                            </div>
                          ) : task.notes ? (
                            <p
                              className="text-white/50 text-sm mt-1 cursor-pointer hover:text-white/70 flex items-start gap-1"
                              onClick={() => setEditingNotes(task._id)}
                            >
                              <NotesIcon className="flex-shrink-0 mt-0.5 text-white/40" />
                              <span className="line-clamp-2">{task.notes}</span>
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditingNotes(task._id)}
                              className="text-white/30 hover:text-white/50 text-xs mt-1 flex items-center gap-1 transition-colors"
                            >
                              <NotesIcon className="w-3.5 h-3.5" />
                              Add notes
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        <select
                          value={task.priority || "normal"}
                          onChange={(e) => handlePriorityChange(task._id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70 focus:outline-none focus:ring-1 focus:ring-amber-400/40 opacity-60 group-hover:opacity-100 transition-opacity"
                          aria-label="Change priority"
                        >
                          {PRIORITIES.map((p) => (
                            <option key={p.value} value={p.value} className="bg-[#0F1219]">
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDelete(task._id)}
                          className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-all opacity-60 group-hover:opacity-100"
                          aria-label="Delete task"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {completed.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="text-sm text-white/60 hover:text-white/80 mb-4 flex items-center gap-1 transition-colors"
                    >
                      {showCompleted ? "▲" : "▼"} {completed.length} completed
                    </button>
                    {showCompleted && (
                      <ul className="space-y-3">
                        {completed.map((task) => (
                          <li
                            key={task._id}
                            className="group flex justify-between items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked
                                onChange={() => handleToggle(task._id)}
                                className="rounded border-white/30 bg-white/5 w-5 h-5 text-amber-500 focus:ring-amber-400/40 focus:ring-offset-0 accent-amber-500"
                              />
                              <span
                                className={`px-2 py-1 rounded-md text-xs ${
                                  PRIORITIES.find((p) => p.value === (task.priority || "normal"))?.badge ?? "bg-white/10 text-white/70"
                                }`}
                              >
                                {PRIORITIES.find((p) => p.value === (task.priority || "normal"))?.label ?? "Normal"}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="text-white/50 line-through text-sm block">{task.title}</span>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-white/40 flex-wrap">
                                  {task.completedAt && (
                                    <span>Completed {formatDate(task.completedAt)}</span>
                                  )}
                                  {task.createdAt && (
                                    <>
                                      <span>·</span>
                                      <span>Added {formatDate(task.createdAt)}</span>
                                    </>
                                  )}
                                  {task.dueDate && (
                                    <>
                                      <span>·</span>
                                      <span>{formatDueDate(task.dueDate)}</span>
                                    </>
                                  )}
                                </div>
                                {task.notes && (
                                  <p className="text-white/40 text-xs mt-1 flex items-start gap-1">
                                    <NotesIcon className="flex-shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{task.notes}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDelete(task._id)}
                              className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-all opacity-60 group-hover:opacity-100"
                              aria-label="Delete task"
                            >
                              <TrashIcon />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {completed.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCompleted}
                    className="w-full mt-6 flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white/90 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <CheckIcon className="text-white/50" />
                      <span>Clear completed</span>
                    </div>
                    <span className="text-white/50 text-sm">
                      {completed.length} task{completed.length !== 1 ? "s" : ""}
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
