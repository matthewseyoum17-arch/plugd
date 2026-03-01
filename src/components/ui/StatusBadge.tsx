const statusStyles: Record<string, string> = {
  pending: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  submitted: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  confirmed: "bg-green-500/10 text-green-400 border border-green-500/20",
  active: "bg-neon/10 text-neon border border-neon/20",
  approved: "bg-neon/10 text-neon border border-neon/20",
  auto_approved: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  disputed: "bg-red-500/10 text-red-400 border border-red-500/20",
  rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
  paused: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  closed: "bg-white/5 text-gray-400 border border-white/10",
  paid: "bg-neon/10 text-neon border border-neon/20",
};

export function StatusBadge({ status }: { status: string }) {
  const style =
    statusStyles[status] || "bg-white/5 text-gray-400 border border-white/10";
  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-button ${style}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
