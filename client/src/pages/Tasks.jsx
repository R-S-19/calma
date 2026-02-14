import { useState, useEffect } from "react";
import { API_URL } from "../lib/api";
import { getToken } from "../lib/auth";
import { useLevelUpToast } from "../context/LevelUpToastContext";
import Layout from "../components/Layout";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const { showLevelUp } = useLevelUpToast();
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks</h2>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="What do you need to do?"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !newTitle.trim()}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded mb-4">{error}</p>
      )}

      {loading ? (
        <p className="text-gray-600">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-600">No tasks yet. Add one above.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task._id)}
                className="rounded border-gray-300"
              />
              <span
                className={`flex-1 ${task.completed ? "text-gray-500 line-through" : "text-gray-800"}`}
              >
                {task.title}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(task._id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  )
}
