import { useNavigate } from "react-router-dom";
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
        <h1 className="text-xl font-semibold text-gray-800">Calma</h1>
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
