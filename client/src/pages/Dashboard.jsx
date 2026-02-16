import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../lib/api";
import { getToken, removeToken } from "../lib/auth";
import Layout from "../components/Layout";
import GrowthPanel from "../components/growth/GrowthPanel";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
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
        if (!res.ok) return null;
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
    return (
      <Layout>
        <p className="text-gray-600">Loading…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h2 className="text-2xl font-semibold text-gray-800 mb-1">
        {getGreeting()}
      </h2>
      <p className="text-sm text-gray-500 mb-6">Signed in as {user?.email}</p>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          to="/tasks"
          className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors text-center"
        >
          Add task
        </Link>
        <Link
          to="/focus"
          className="flex-1 min-w-[120px] px-4 py-3 rounded-xl bg-[#87a878] text-white font-medium hover:bg-[#7a906f] transition-colors text-center"
        >
          Start focus
        </Link>
        <Link
          to="/habits"
          className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors text-center"
        >
          Mark habit
        </Link>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-2xl font-semibold text-gray-800">
              {summary.tasksCompletedToday}
              {summary.totalTasks > 0 && (
                <span className="text-gray-500 font-normal text-base"> / {summary.totalTasks}</span>
              )}
            </p>
            <p className="text-sm text-gray-500">Tasks done today</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-2xl font-semibold text-gray-800">
              {summary.habitsDoneToday}
              {summary.totalHabits > 0 && (
                <span className="text-gray-500 font-normal text-base"> / {summary.totalHabits}</span>
              )}
            </p>
            <p className="text-sm text-gray-500">Habits done today</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-2xl font-semibold text-gray-800">{summary.focusSessionsToday}</p>
            <p className="text-sm text-gray-500">Focus sessions today</p>
          </div>
        </div>
      )}

      <div className="max-w-md">
        <GrowthPanel />
      </div>
    </Layout>
  )
}
