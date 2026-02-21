import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Earnings() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role

  if (role !== 'founder') {
    redirect('/dashboard/setter')
  }

  const { data: payouts } = await supabase
    .from('payouts')
    .select('*, appointments(contact_name, listings(title))')
    .eq('founder_id', user.id)
    .order('created_at', { ascending: false })

  const totalPaid = payouts?.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const totalPending = payouts?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const totalProcessing = payouts?.filter(p => p.status === 'processing').reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  const stats = [
    { name: 'Total Paid', value: `$${(totalPaid / 100).toFixed(2)}`, color: 'text-green-400' },
    { name: 'Pending', value: `$${((totalPending + totalProcessing) / 100).toFixed(2)}`, color: 'text-yellow-400' },
    { name: 'Transactions', value: payouts?.length || 0, color: 'text-white' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-900 text-green-300'
      case 'pending': return 'bg-yellow-900 text-yellow-300'
      case 'processing': return 'bg-blue-900 text-blue-300'
      case 'failed': return 'bg-red-900 text-red-300'
      default: return 'bg-gray-700 text-gray-300'
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Earnings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">{stat.name}</p>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Listing</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {payouts?.map((payout) => (
              <tr key={payout.id} className="hover:bg-gray-750">
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(payout.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">{payout.appointments?.contact_name || 'N/A'}</td>
                <td className="px-6 py-4">{payout.appointments?.listings?.title || 'N/A'}</td>
                <td className="px-6 py-4">${((payout.amount || 0) / 100).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payout.status)}`}>
                    {payout.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!payouts || payouts.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
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
