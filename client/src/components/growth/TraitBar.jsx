export default function TraitBar({ label, level, percent }) {
  return (
    <div className="py-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-500">Level {level}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#87a878] transition-all duration-300 ease-in-out"
          style={{ width: `${Math.min(100, percent ?? 0)}%` }}
        />
      </div>
    </div>
  )
}
