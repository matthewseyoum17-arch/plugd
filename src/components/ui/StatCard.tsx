export function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-xl p-6 shadow-sm">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 font-heading">
        {label}
      </p>
      <p className="text-3xl font-bold text-white font-sans">{value}</p>
      {sublabel && (
        <p className="text-sm text-white mt-2 font-medium">{sublabel}</p>
      )}
    </div>
  );
}
