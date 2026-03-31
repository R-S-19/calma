import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className={`relative inline-flex h-7 w-11 shrink-0 cursor-pointer items-center rounded-full border border-app p-0.5 transition-colors hover:bg-[var(--app-surface-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-ring)] ${className}`}
    >
      <span
        className={`block h-5 w-5 rounded-full bg-amber-600 shadow-sm transition-all dark:bg-amber-500 ${dark ? "ml-auto" : ""}`}
        aria-hidden
      />
    </button>
  );
}
