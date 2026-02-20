import { useNavigate, Link, useLocation } from "react-router-dom";
import { removeToken } from "../lib/auth";
import { useFocusTimer } from "../context/FocusTimerContext";

function NavLink({ to, children, current }) {
  const isActive = current;
  return (
    <Link
      to={to}
      className={
        isActive
          ? "text-white border-b-2 border-amber-400/80 pb-0.5 shadow-[0_0_12px_rgba(212,165,116,0.3)]"
          : "text-white/60 hover:text-white/80"
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0F1219] via-[#16191F] to-[#0D1014]">
      <header className="px-4 py-3 flex justify-between items-center bg-transparent border-b border-white/10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white/80">Calma</h1>
          {isRunning && (
            <Link
              to="/focus"
              className="flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium bg-amber-500/20 text-amber-400"
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
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-white/60 hover:text-white/80"
        >
          Log out
        </button>
      </header>
      <main className={`flex-1 ${location.pathname === "/tasks" ? "p-0" : "p-4"}`}>
        {children}
      </main>
    </div>
  )
}
