import { useState } from "react";
import { useGrowth } from "../../hooks/useGrowth";
import TraitBar from "./TraitBar";
import { TRAIT_KEYS, TRAIT_LABELS } from "../../config/traits";

export default function GrowthPanel() {
  const { growth, loading, error } = useGrowth();
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2 mt-2" />
      </div>
    );
  }

  if (error || !growth) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-gray-500 text-sm">
        Growth data unavailable.
      </div>
    );
  }

  const { totalLevel, title, traits, recentGrowth } = growth;
  let remainingXP = null;
  for (const key of TRAIT_KEYS) {
    const t = traits?.[key];
    if (t && t.level < 50 && t.requiredXP != null) {
      const r = Math.max(0, t.requiredXP - (t.xp ?? 0));
      if (remainingXP === null || r < remainingXP) remainingXP = r;
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors duration-300 ease-in-out"
      >
        <div>
          <p className="text-sm font-medium text-[#87a878]">🌿 Growth</p>
          <p className="text-gray-800 font-semibold">Level {totalLevel}</p>
          <p className="text-sm text-gray-600 mt-1">{title}</p>
        </div>
        <span className="text-gray-400 text-sm">
          {expanded ? "▲" : "View Details →"}
        </span>
      </button>

      {expanded && (
        <div
          className="px-4 pb-4 border-t border-gray-100"
          style={{ animation: "slideDown 0.3s ease-in-out" }}
        >
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div className="space-y-1 mt-4">
            {TRAIT_KEYS.map((key) => {
              const t = traits?.[key];
              if (!t) return null;
              return (
                <TraitBar
                  key={key}
                  label={TRAIT_LABELS[key] || key}
                  level={t.level}
                  percent={t.progressPercent ?? 0}
                />
              );
            })}
          </div>

          {totalLevel < 50 && remainingXP != null && (
            <p className="text-xs text-gray-500 mt-4">
              Next level in {remainingXP} growth points
            </p>
          )}

          {recentGrowth && recentGrowth.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Recent growth
              </h4>
              <ul className="space-y-1">
                {recentGrowth.slice(0, 3).map((g, i) => (
                  <li key={i} className="text-sm text-gray-600">
                    {g.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
