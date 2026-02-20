import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../lib/api";
import { setToken } from "../lib/auth";

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
    } catch (err) {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#0F1219] via-[#16191F] to-[#0D1014]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,165,116,0.1),transparent_60%)] blur-3xl opacity-50 pointer-events-none" aria-hidden />
      <div className="relative w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6">Sign up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-transparent"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">
              Password (min 8 characters)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-transparent"
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
        <p className="mt-4 text-sm text-white/60">
          Already have an account? <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  )
}
