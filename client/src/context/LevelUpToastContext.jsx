import { createContext, useContext, useState, useCallback } from "react";
import { TRAIT_LABELS } from "../config/traits";

const LevelUpToastContext = createContext(null);

export function LevelUpToastProvider({ children }) {
  const [message, setMessage] = useState(null);

  const showLevelUp = useCallback((traitKeys) => {
    if (!traitKeys || traitKeys.length === 0) return;
    const msg = traitKeys.map((k) => `${TRAIT_LABELS[k] || k} strengthened.`).join(" ");
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  return (
    <LevelUpToastContext.Provider value={{ showLevelUp, message }}>
      {children}
    </LevelUpToastContext.Provider>
  );
}

export function useLevelUpToast() {
  const ctx = useContext(LevelUpToastContext);
  return ctx || { showLevelUp: () => {}, message: null };
}
