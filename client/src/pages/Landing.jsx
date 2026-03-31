import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function Landing() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 app-gradient-bg">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div
        className="absolute inset-0 app-radial-glow blur-3xl opacity-50 pointer-events-none"
        aria-hidden
      />
      <div className="relative">
        <h1 className="text-3xl font-bold text-app mb-2">Calma</h1>
        <p className="text-app-muted mb-8">ADHD-friendly productivity</p>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl border border-app bg-app-surface text-app-secondary hover:bg-[var(--app-surface-hover)] transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl bg-amber-600/90 text-white hover:bg-amber-500/90 transition-colors shadow-lg shadow-amber-500/20"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
