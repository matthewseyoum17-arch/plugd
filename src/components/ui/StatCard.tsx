export function StatCard({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
    </div>
  )
}
