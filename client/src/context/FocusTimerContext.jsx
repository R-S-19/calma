import { createContext, useContext, useState, useEffect } from "react";

const FocusTimerContext = createContext(null);

export function FocusTimerProvider({ children }) {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timesUp, setTimesUp] = useState(false);

  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;
    const id = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setTimesUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, timeRemaining]);

  function start() {
    setTimesUp(false);
    setIsRunning(true);
  }

  function pause() {
    setIsRunning(false);
  }

  function reset() {
    setIsRunning(false);
    setTimesUp(false);
    setTimeRemaining(25 * 60);
  }

  function selectPreset(seconds) {
    if (!isRunning) {
      setTimeRemaining(seconds);
      setTimesUp(false);
    }
  }

  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  const value = {
    timeRemaining,
    isRunning,
    timesUp,
    start,
    pause,
    reset,
    selectPreset,
    formatTime,
  };

  return (
    <FocusTimerContext.Provider value={value}>
      {children}
    </FocusTimerContext.Provider>
  );
}

export function useFocusTimer() {
  const ctx = useContext(FocusTimerContext);
  if (!ctx) throw new Error("useFocusTimer must be used within FocusTimerProvider");
  return ctx;
}
