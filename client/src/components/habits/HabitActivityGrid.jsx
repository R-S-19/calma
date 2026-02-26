import { useState } from "react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthGrid(year, month) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const daysInMonth = last.getDate();
  const startDay = first.getDay();
  const grid = [];
  let week = Array(7).fill(null);

  for (let i = 0; i < startDay; i++) {
    week[i] = { date: null, day: null };
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = (startDay + d - 1) % 7;
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    week[dayOfWeek] = { date: dateStr, day: d };
    if (dayOfWeek === 6 || d === daysInMonth) {
      grid.push([...week]);
      week = Array(7).fill(null);
    }
  }

  if (week.some((c) => c !== null)) {
    grid.push(week);
  }

  return grid;
}

function isFuture(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr > today;
}

export default function HabitActivityGrid({ completionDates = [], month, year, habitName }) {
  const [hovered, setHovered] = useState(null);
  const grid = getMonthGrid(year, month);
  const completedSet = new Set(completionDates);

  const monthName = new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/60 font-medium truncate max-w-[120px]" title={habitName}>
          {habitName}
        </span>
        <span className="text-xs text-white/40">{monthName}</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex gap-1 justify-center">
          {DAY_LABELS.map((label) => (
            <span key={label} className="w-3 text-center text-[9px] text-white/40 flex-shrink-0">
              {label.slice(0, 1)}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {grid.map((week, wi) => (
            <div key={wi} className="flex gap-1 justify-center">
              {week.map((cell, di) => {
                if (!cell || !cell.date) {
                  return (
                    <div
                      key={`${wi}-${di}-empty`}
                      className="w-3 h-3 rounded-sm bg-white/5 flex-shrink-0"
                      aria-hidden
                    />
                  );
                }
                const completed = completedSet.has(cell.date);
                const future = isFuture(cell.date);
                const isHovered = hovered === cell.date;
                return (
                  <div
                    key={cell.date}
                    className={`w-3 h-3 rounded-sm flex-shrink-0 transition-colors ${
                      future
                        ? "bg-white/5"
                        : completed
                          ? isHovered
                            ? "bg-amber-400"
                            : "bg-amber-500/70"
                          : isHovered
                            ? "bg-white/20"
                            : "bg-white/10"
                    }`}
                    title={`${cell.date}${completed ? " - Done" : future ? " - Future" : " - Not done"}`}
                    onMouseEnter={() => setHovered(cell.date)}
                    onMouseLeave={() => setHovered(null)}
                    aria-label={`${cell.date}${completed ? ", completed" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-white/40">
        <div className="w-3 h-3 rounded-sm bg-white/10" />
        <span>Not done</span>
        <div className="w-3 h-3 rounded-sm bg-amber-500/70" />
        <span>Done</span>
      </div>
    </div>
  );
}
