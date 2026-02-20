export default function TraitBar({ label, level, percent }) {
  return (
    <div className="py-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-white/80">{label}</span>
        <span className="text-white/50">Level {level}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500/80 transition-all duration-300 ease-in-out"
          style={{ width: `${Math.min(100, percent ?? 0)}%` }}
        />
      </div>
    </div>
  )
}
