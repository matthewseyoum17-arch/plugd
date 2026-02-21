import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SetterEarnings() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role

  if (role !== 'setter') {
    redirect('/dashboard/founder')
  }

  const { data: payouts } = await supabase
    .from('payouts')
    .select('*, appointments(contact_name, listings(title))')
    .eq('setter_id', user.id)
    .order('created_at', { ascending: false })

  const totalPaid = payouts?.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const totalPending = payouts?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  const stats = [
    { name: 'Total Earned', value: `$${(totalPaid / 100).toFixed(2)}`, color: 'text-[#00FF94]' },
    { name: 'Pending', value: `$${((totalPending) / 100).toFixed(2)}`, color: 'text-yellow-400' },
    { name: 'Payouts', value: payouts?.length || 0, color: 'text-white' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-900/30 text-green-400 border border-green-800'
      case 'pending': return 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
      case 'processing': return 'bg-blue-900/30 text-blue-400 border border-blue-800'
      case 'failed': return 'bg-red-900/30 text-red-400 border border-red-800'
      default: return 'bg-gray-800/30 text-gray-400 border border-gray-700'
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Earnings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <p className="text-gray-400 text-sm">{stat.name}</p>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#111]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {payouts?.map((payout) => (
              <tr key={payout.id} className="hover:bg-[#1f1f1f]">
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(payout.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-white">{payout.appointments?.contact_name || 'N/A'}</td>
                <td className="px-6 py-4 text-gray-300">{payout.appointments?.listings?.title || 'N/A'}</td>
                <td className="px-6 py-4 text-[#00FF94] font-medium">${((payout.amount || 0) / 100).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(payout.status)}`}>
                    {payout.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!payouts || payouts.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No payouts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
