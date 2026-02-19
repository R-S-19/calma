import { useNavigate, Link, useLocation } from "react-router-dom";
import { removeToken } from "../lib/auth";
import { useFocusTimer } from "../context/FocusTimerContext";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRunning, timeRemaining, formatTime } = useFocusTimer();

  const isTasksPage = location.pathname === "/tasks";

  function handleLogout() {
    removeToken();
    navigate("/", { replace: true });
  }

  return (
    <div className={`min-h-screen flex flex-col ${isTasksPage ? "bg-gradient-to-b from-[#0F1219] via-[#16191F] to-[#0D1014]" : "bg-white"}`}>
      <header
        className={`px-4 py-3 flex justify-between items-center ${
          isTasksPage
            ? "bg-transparent border-b border-white/10"
            : "border-b border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-4">
          <h1
            className={`text-xl font-semibold ${isTasksPage ? "text-white/80" : "text-gray-800"}`}
          >
            Calma
          </h1>
          {isRunning && (
            <Link
              to="/focus"
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium ${
                isTasksPage
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              <span className="animate-pulse">●</span>
              {formatTime(timeRemaining)}
            </Link>
          )}
          <nav className="flex gap-3 text-sm">
            <Link
              to="/dashboard"
              className={
                isTasksPage
                  ? "text-white/60 hover:text-white/80"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              Dashboard
            </Link>
            <Link
              to="/tasks"
              className={
                isTasksPage
                  ? "text-white border-b-2 border-amber-400/80 pb-0.5 shadow-[0_0_12px_rgba(212,165,116,0.3)]"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              Tasks
            </Link>
            <Link
              to="/habits"
              className={
                isTasksPage
                  ? "text-white/60 hover:text-white/80"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              Habits
            </Link>
            <Link
              to="/focus"
              className={
                isTasksPage
                  ? "text-white/60 hover:text-white/80"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              Focus
            </Link>
          </nav>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={
            isTasksPage
              ? "text-sm text-white/60 hover:text-white/80"
              : "text-sm text-gray-600 hover:text-gray-800"
          }
        >
          Log out
        </button>
      </header>
      <main className={isTasksPage ? "flex-1 p-0" : "flex-1 p-4"}>
        {children}
      </main>
    </div>
  )
}
