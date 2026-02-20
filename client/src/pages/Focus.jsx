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
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-white mb-6">Focus timer</h2>

        <div className="flex gap-2 mb-8">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => selectPreset(p.seconds)}
              disabled={isRunning}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${
                timeRemaining === p.seconds && !isRunning
                  ? "bg-amber-600/90 text-white shadow-lg shadow-amber-500/20"
                  : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-12 text-center shadow-[0_0_40px_rgba(212,165,116,0.06)]">
          <p
            className={`text-5xl md:text-6xl font-mono font-medium mb-6 ${
              timesUp ? "text-amber-400" : "text-white"
            }`}
          >
            {formatTime(timeRemaining)}
          </p>
          {timesUp && (
            <p className="text-amber-400 font-medium mb-6">Time's up. Nice focus.</p>
          )}
          <div className="flex justify-center gap-3 flex-wrap">
            {!isRunning && timeRemaining > 0 && (
              <button
                type="button"
                onClick={start}
                className="px-6 py-3 rounded-xl bg-amber-600/90 hover:bg-amber-500/90 text-white font-medium transition-all shadow-lg shadow-amber-500/20"
              >
                Start
              </button>
            )}
            {isRunning && (
              <button
                type="button"
                onClick={pause}
                className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all"
              >
                Pause
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
