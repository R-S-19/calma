import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../lib/api";
import { setToken } from "../lib/auth";
import ThemeToggle from "../components/ThemeToggle";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }
      setToken(data.token);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 app-gradient-bg">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div
        className="absolute inset-0 app-radial-glow blur-3xl opacity-50 pointer-events-none"
        aria-hidden
      />
      <div className="relative w-full max-w-sm">
        <h1 className="text-2xl font-bold text-app mb-6">Sign up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-app-secondary mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-app-input border border-app rounded-xl text-app placeholder:text-[var(--app-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--app-ring)] focus:border-transparent"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-app-secondary mb-1">
              Password (min 8 characters)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2.5 bg-app-input border border-app rounded-xl text-app placeholder:text-[var(--app-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--app-ring)] focus:border-transparent"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-amber-600/90 text-white font-medium hover:bg-amber-500/90 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-sm text-app-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-700 dark:text-amber-400 hover:opacity-90 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
