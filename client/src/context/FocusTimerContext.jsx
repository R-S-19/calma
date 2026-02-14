import { createContext, useContext, useState, useEffect, useRef } from "react";
import { API_URL } from "../lib/api";
import { getToken } from "../lib/auth";
import { useLevelUpToast } from "./LevelUpToastContext";

const FocusTimerContext = createContext(null);

export function FocusTimerProvider({ children }) {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timesUp, setTimesUp] = useState(false);
  const hasReportedSession = useRef(false);
  const { showLevelUp } = useLevelUpToast();

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

  useEffect(() => {
    if (!timesUp || hasReportedSession.current) return;
    hasReportedSession.current = true;
    const token = getToken();
    if (token) {
      fetch(`${API_URL}/api/growth/apply-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ actionType: "FOCUS_SESSION_COMPLETE" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.leveledUpTraits?.length) showLevelUp(data.leveledUpTraits);
        })
        .catch(() => {});
    }
  }, [timesUp, showLevelUp]);

  function start() {
    setTimesUp(false);
    setIsRunning(true);
  }

  function pause() {
    setIsRunning(false);
  }

  function reset() {
    hasReportedSession.current = false;
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
