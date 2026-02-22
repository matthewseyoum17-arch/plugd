const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-800',
  submitted: 'bg-yellow-900/30 text-yellow-400 border border-yellow-800',
  confirmed: 'bg-green-900/30 text-green-400 border border-green-800',
  active: 'bg-green-900/30 text-green-400 border border-green-800',
  approved: 'bg-green-900/30 text-green-400 border border-green-800',
  auto_approved: 'bg-blue-900/30 text-blue-400 border border-blue-800',
  disputed: 'bg-red-900/30 text-red-400 border border-red-800',
  rejected: 'bg-red-900/30 text-red-400 border border-red-800',
  paused: 'bg-yellow-900/30 text-yellow-400 border border-yellow-800',
  closed: 'bg-gray-800/30 text-gray-400 border border-gray-700',
  paid: 'bg-green-900/30 text-green-400 border border-green-800',
}

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || 'bg-gray-800/30 text-gray-400 border border-gray-700'
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
