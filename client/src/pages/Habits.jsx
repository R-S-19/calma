import { useState, useEffect } from "react";
import { API_URL } from "../lib/api";
import { getToken } from "../lib/auth";
import { useLevelUpToast } from "../context/LevelUpToastContext";
import Layout from "../components/Layout";
import HabitActivityGrid from "../components/habits/HabitActivityGrid";

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const { showLevelUp } = useLevelUpToast();
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };

  function fetchHabits() {
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/habits?month=${viewMonth}`, { headers })
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
  }, [viewMonth]);

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
        const today = new Date().toISOString().slice(0, 10);
        const todayInView = today.startsWith(viewMonth);
        if (method === "POST") {
          setHabits((prev) =>
            prev.map((h) =>
              h._id === habit._id
                ? {
                    ...h,
                    completedToday: true,
                    completionDates: todayInView ? [...(h.completionDates || []), today] : h.completionDates || [],
                  }
                : h
            )
          );
          if (data?.leveledUpTraits?.length) showLevelUp(data.leveledUpTraits);
        } else {
          setHabits((prev) =>
            prev.map((h) =>
              h._id === habit._id
                ? {
                    ...h,
                    completedToday: false,
                    completionDates: todayInView ? (h.completionDates || []).filter((d) => d !== today) : h.completionDates || [],
                  }
                : h
            )
          );
        }
      })
      .catch(() => setError("Could not update habit"));
  }

  function handleEditName(habit) {
    setEditingId(habit._id);
    setEditingName(habit.name);
  }

  function handleSaveName(id) {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    fetch(`${API_URL}/api/habits/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      })
      .then((data) => {
        setHabits((prev) =>
          prev.map((h) => (h._id === data.habit._id ? { ...h, name: data.habit.name } : h))
        );
        setEditingId(null);
      })
      .catch(() => setError("Could not update habit name"));
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
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">Habits</h2>
            <p className="text-sm text-white/60">{today}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const [y, m] = viewMonth.split("-").map(Number);
                const prev = new Date(y, m - 2, 1);
                setViewMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`);
              }}
              className="px-2 py-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-sm"
            >
              ←
            </button>
            <span className="text-sm text-white/70 min-w-[80px] text-center">
              {new Date(viewMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              onClick={() => {
                const [y, m] = viewMonth.split("-").map(Number);
                const next = new Date(y, m, 1);
                setViewMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`);
              }}
              disabled={viewMonth >= new Date().toISOString().slice(0, 7)}
              className="px-2 py-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 mb-6 shadow-[0_0_40px_rgba(212,165,116,0.06)]">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Meditate 5 min"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-transparent"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !newName.trim()}
              className="px-4 py-3 rounded-xl bg-amber-600/90 hover:bg-amber-500/90 text-white font-medium transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              Add
            </button>
          </form>
        </div>

        {error && (
          <p className="text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-6">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-white/50">Loading habits…</p>
        ) : habits.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/60 text-lg mb-2">No habits yet.</p>
            <p className="text-white/40 text-sm">
              Add one above when you're ready. Small steps add up.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {habits.map((habit) => (
              <li
                key={habit._id}
                className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(habit)}
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      habit.completedToday
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "border-white/30 hover:border-amber-400/60"
                    }`}
                    title={habit.completedToday ? "Mark not done" : "Mark done for today"}
                  >
                    {habit.completedToday && "✓"}
                  </button>
                  {editingId === habit._id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleSaveName(habit._id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName(habit._id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-400/40"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEditName(habit)}
                      className={`flex-1 text-left ${habit.completedToday ? "text-white/50 line-through" : "text-white font-medium"} hover:text-amber-400/80 transition-colors`}
                    >
                      {habit.name}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(habit._id)}
                    className="text-sm text-white/60 hover:text-amber-400 opacity-60 group-hover:opacity-100 transition-all"
                  >
                    Delete
                  </button>
                </div>
                <div className="px-4 pb-4">
                  <HabitActivityGrid
                    completionDates={habit.completionDates || []}
                    month={parseInt(viewMonth.split("-")[1], 10)}
                    year={parseInt(viewMonth.split("-")[0], 10)}
                    habitName={habit.name}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}
