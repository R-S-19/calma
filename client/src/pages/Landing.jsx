import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Calma</h1>
      <p className="text-gray-600 mb-8">ADHD-friendly productivity</p>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          Log in
        </Link>
        <Link
          to="/register"
          className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
        >
          Sign up
        </Link>
      </div>
    </div>
  )
}
