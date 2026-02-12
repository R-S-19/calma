import { Link } from "react-router-dom";
import { useFocusTimer } from "../context/FocusTimerContext";
import Layout from "../components/Layout";

const PRESETS = [
  { label: "25 min", seconds: 25 * 60 },
  { label: "15 min", seconds: 15 * 60 },
  { label: "5 min", seconds: 5 * 60 },
];

export default function Focus() {
  const {
    timeRemaining,
    isRunning,
    timesUp,
    start,
    pause,
    reset,
    selectPreset,
    formatTime,
  } = useFocusTimer();

  return (
    <Layout>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Focus timer</h2>

      <div className="flex gap-2 mb-6">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => selectPreset(p.seconds)}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              timeRemaining === p.seconds && !isRunning
                ? "bg-gray-800 text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="text-center py-8">
        <p
          className={`text-5xl font-mono font-medium mb-6 ${
            timesUp ? "text-green-600" : "text-gray-800"
          }`}
        >
          {formatTime(timeRemaining)}
        </p>
        {timesUp && (
          <p className="text-green-600 font-medium mb-4">Time's up. Nice focus.</p>
        )}
        <div className="flex justify-center gap-3">
          {!isRunning && timeRemaining > 0 && (
            <button
              type="button"
              onClick={start}
              className="px-6 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
            >
              Start
            </button>
          )}
          {isRunning && (
            <button
              type="button"
              onClick={pause}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Pause
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>
    </Layout>
  )
}
