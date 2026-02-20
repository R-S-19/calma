import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FocusTimerProvider } from "./context/FocusTimerContext";
import { LevelUpToastProvider, useLevelUpToast } from "./context/LevelUpToastContext";
import { getToken } from "./lib/auth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Habits from "./pages/Habits";
import Focus from "./pages/Focus";

function ProtectedRoute({ children }) {
  if (!getToken()) return <Navigate to="/" replace />;
  return children;
}

function LevelUpToast() {
  const { message } = useLevelUpToast();
  if (!message) return null;
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-amber-600/95 text-white text-sm font-medium shadow-lg shadow-amber-500/30 z-50 animate-[pulse_0.5s_ease-out]"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

export default function App() {
  return (
    <LevelUpToastProvider>
      <BrowserRouter>
        <FocusTimerProvider>
      <Routes>
        <Route
          path="/"
          element={getToken() ? <Navigate to="/dashboard" replace /> : <Landing />}
        />
        <Route
          path="/login"
          element={getToken() ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={getToken() ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/habits"
          element={
            <ProtectedRoute>
              <Habits />
            </ProtectedRoute>
          }
        />
        <Route
          path="/focus"
          element={
            <ProtectedRoute>
              <Focus />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
        </FocusTimerProvider>
        <LevelUpToast />
      </BrowserRouter>
    </LevelUpToastProvider>
  )
}
