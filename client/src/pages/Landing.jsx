import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#0F1219] via-[#16191F] to-[#0D1014]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,165,116,0.1),transparent_60%)] blur-3xl opacity-50 pointer-events-none" aria-hidden />
      <div className="relative">
        <h1 className="text-3xl font-bold text-white mb-2">Calma</h1>
        <p className="text-white/60 mb-8">ADHD-friendly productivity</p>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition-colors"
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
  )
}
