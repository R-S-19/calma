import { useNavigate, Link, useLocation } from "react-router-dom";
import { removeToken } from "../lib/auth";
import { useFocusTimer } from "../context/FocusTimerContext";
import ThemeToggle from "./ThemeToggle";

function NavLink({ to, children, current }) {
  const isActive = current;
  return (
    <Link
      to={to}
      className={
        isActive
          ? "bg-transparent text-app border-b-2 border-amber-600/80 dark:border-amber-400/80 pb-0.5"
          : "bg-transparent text-app-muted hover:text-app-secondary"
      }
    >
      {children}
    </Link>
  );
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRunning, timeRemaining, formatTime } = useFocusTimer();

  function handleLogout() {
    removeToken();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col app-gradient-bg">
      <header className="px-4 py-3 flex justify-between items-center bg-transparent border-b border-app">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-xl font-semibold text-app-secondary">Calma</h1>
          {isRunning && (
            <Link
              to="/focus"
              className="flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium bg-amber-500/20 text-amber-800 dark:text-amber-400"
            >
              <span className="animate-pulse">●</span>
              {formatTime(timeRemaining)}
            </Link>
          )}
          <nav className="flex gap-3 text-sm">
            <NavLink to="/dashboard" current={location.pathname === "/dashboard"}>
              Dashboard
            </NavLink>
            <NavLink to="/tasks" current={location.pathname === "/tasks"}>
              Tasks
            </NavLink>
            <NavLink to="/habits" current={location.pathname === "/habits"}>
              Habits
            </NavLink>
            <NavLink to="/focus" current={location.pathname === "/focus"}>
              Focus
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-app-muted hover:text-app-secondary bg-transparent border-0 cursor-pointer"
          >
            Log out
          </button>
        </div>
      </header>
      <main className={`flex-1 ${location.pathname === "/tasks" ? "p-0" : "p-4"}`}>
        {children}
      </main>
    </div>
  );
}
