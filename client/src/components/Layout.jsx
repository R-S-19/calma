import { useNavigate, Link } from "react-router-dom";
import { removeToken } from "../lib/auth";

export default function Layout({ children }) {
  const navigate = useNavigate();

  function handleLogout() {
    removeToken();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">Calma</h1>
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
