import { useNavigate, Link } from "react-router-dom";
import { removeToken } from "../lib/auth";
import { useFocusTimer } from "../context/FocusTimerContext";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { isRunning, timeRemaining, formatTime } = useFocusTimer();

  function handleLogout() {
    removeToken();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">Calma</h1>
          {isRunning && (
            <Link
              to="/focus"
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-100 text-amber-800 text-sm font-medium"
            >
              <span className="animate-pulse">●</span>
              {formatTime(timeRemaining)}
            </Link>
          )}
          <nav className="flex gap-3 text-sm">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">
              Dashboard
            </Link>
            <Link to="/tasks" className="text-gray-600 hover:text-gray-800">
              Tasks
            </Link>
            <Link to="/habits" className="text-gray-600 hover:text-gray-800">
              Habits
            </Link>
            <Link to="/focus" className="text-gray-600 hover:text-gray-800">
              Focus
            </Link>
          </nav>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Log out
        </button>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}
