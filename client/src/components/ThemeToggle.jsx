import { useTheme } from "../context/ThemeContext";

const labels = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export default function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();

  return (
    <label className={`inline-flex items-center gap-2 ${className}`}>
      <span className="sr-only">Color theme</span>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 text-xs font-medium text-app-muted hover:bg-[var(--app-surface-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-ring)] cursor-pointer"
        aria-label="Color theme: use system, light, or dark"
      >
        <option value="system">{labels.system}</option>
        <option value="light">{labels.light}</option>
        <option value="dark">{labels.dark}</option>
      </select>
    </label>
  );
}
