import { useState, useEffect } from "react";
import { API_URL } from "../lib/api";
import { getToken } from "../lib/auth";
import { useLevelUpToast } from "../context/LevelUpToastContext";
import Layout from "../components/Layout";

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const { showLevelUp } = useLevelUpToast();
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };

  function fetchHabits() {
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/habits`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load habits");
        return res.json();
      })
      .then((data) => setHabits(data.habits || []))
      .catch(() => setError("Could not load habits"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchHabits();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/habits`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add habit");
      setHabits((prev) => [data.habit, ...prev]);
      setNewName("");
    } catch (err) {
      setError(err.message || "Could not add habit");
    } finally {
      setSubmitting(false);
    }
  }

  function handleToggleComplete(habit) {
    const url = `${API_URL}/api/habits/${habit._id}/complete`;
    const method = habit.completedToday ? "DELETE" : "POST";
    fetch(url, { method, headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        return method === "POST" ? res.json() : null;
      })
      .then((data) => {
        if (method === "POST") {
          setHabits((prev) =>
            prev.map((h) =>
              h._id === habit._id ? { ...h, completedToday: true } : h
            )
          );
          if (data?.leveledUpTraits?.length) showLevelUp(data.leveledUpTraits);
        } else {
          setHabits((prev) =>
            prev.map((h) =>
              h._id === habit._id ? { ...h, completedToday: false } : h
            )
          );
        }
      })
      .catch(() => setError("Could not update habit"));
  }

  function handleDelete(id) {
    fetch(`${API_URL}/api/habits/${id}`, { method: "DELETE", headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        setHabits((prev) => prev.filter((h) => h._id !== id));
      })
      .catch(() => setError("Could not delete habit"));
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Layout>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Habits</h2>
      <p className="text-sm text-gray-500 mb-4">{today}</p>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. Meditate 5 min"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !newName.trim()}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded mb-4">{error}</p>
      )}

      {loading ? (
        <p className="text-gray-600">Loading habits…</p>
      ) : habits.length === 0 ? (
        <p className="text-gray-600">No habits yet. Add one above.</p>
      ) : (
        <ul className="space-y-2">
          {habits.map((habit) => (
            <li
              key={habit._id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white"
            >
              <button
                type="button"
                onClick={() => handleToggleComplete(habit)}
                className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
                  habit.completedToday
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300 hover:border-gray-500"
                }`}
                title={habit.completedToday ? "Mark not done" : "Mark done for today"}
              >
                {habit.completedToday && "✓"}
              </button>
              <span
                className={`flex-1 ${habit.completedToday ? "text-gray-500 line-through" : "text-gray-800"}`}
              >
                {habit.name}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(habit._id)}
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
