import { useState, useEffect } from "react";
import { API_URL } from "../lib/api";
import { getToken } from "../lib/auth";
import { useLevelUpToast } from "../context/LevelUpToastContext";
import Layout from "../components/Layout";

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

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const { showLevelUp } = useLevelUpToast();
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

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
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add task");
      setTasks((prev) => [data.task, ...prev]);
      setNewTitle("");
    } catch (err) {
      setError(err.message || "Could not add task");
    } finally {
      setSubmitting(false);
    }
  }

  function handleToggle(id) {
    fetch(`${API_URL}/api/tasks/${id}`, {
      method: "PATCH",
      headers,
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

  function handleDelete(id) {
    fetch(`${API_URL}/api/tasks/${id}`, { method: "DELETE", headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        setTasks((prev) => prev.filter((t) => t._id !== id));
      })
      .catch(() => setError("Could not delete task"));
  }

  return (
    <Layout>
      <h2 className="text-2xl font-semibold text-gray-800 mb-1">Tasks</h2>
      <p className="text-sm text-gray-500 mb-6">One thing at a time.</p>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What do you need to do?"
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#87a878]/30 focus:border-[#87a878] transition-colors"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newTitle.trim()}
            className="px-4 py-2.5 rounded-lg bg-[#87a878] text-white font-medium hover:bg-[#7a906f] disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4">{error}</p>
      )}

      {loading ? (
        <p className="text-gray-500">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-8 text-center">
          <p className="text-gray-500 text-lg mb-2">Nothing on your list yet.</p>
          <p className="text-gray-400 text-sm">
            Add a task above when you're ready. One step at a time.
          </p>
        </div>
      ) : (
        <>
          {(() => {
            const incomplete = tasks.filter((t) => !t.completed);
            const completed = [...tasks.filter((t) => t.completed)].sort(
              (a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0)
            );
            return (
              <>
                <ul className="space-y-3">
                  {incomplete.map((task) => (
                    <li
                      key={task._id}
                      className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white shadow-sm transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggle(task._id)}
                        className="rounded border-gray-300 w-5 h-5 text-[#87a878] focus:ring-[#87a878]"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-800">{task.title}</span>
                        {task.createdAt && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Added {formatDate(task.createdAt)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(task._id)}
                        className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-600 transition-all focus:outline-none"
                        aria-label="Delete task"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>

                {completed.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-600 mb-3">
                      Task history
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="text-sm text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1"
                    >
                      {showCompleted ? "▲" : "▼"} {completed.length} completed
                    </button>
                    {showCompleted && (
                      <ul className="space-y-3">
                        {completed.map((task) => (
                          <li
                            key={task._id}
                            className="group flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50 shadow-sm transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked
                              onChange={() => handleToggle(task._id)}
                              className="rounded border-gray-300 w-5 h-5 text-[#87a878] focus:ring-[#87a878]"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-400 line-through text-sm block">
                                {task.title}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                                {task.completedAt && (
                                  <span>Completed {formatDate(task.completedAt)}</span>
                                )}
                                {task.createdAt && (
                                  <>
                                    <span>·</span>
                                    <span>Added {formatDate(task.createdAt)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDelete(task._id)}
                              className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-600 transition-all focus:outline-none"
                              aria-label="Delete task"
                            >
                              Delete
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}
    </Layout>
  )
}
