import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WalletPanel } from './_components/WalletPanel'

export const dynamic = 'force-dynamic'

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

  const { data: wallet } = await supabase
    .from('founder_wallets')
    .select('*')
    .eq('founder_id', user.id)
    .single()

  const { data: payouts } = await supabase
    .from('payouts')
    .select('*, appointments(contact_name, listings(title))')
    .eq('founder_id', user.id)
    .order('created_at', { ascending: false })

  const { data: transactions } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('founder_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const totalPending = payouts?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.gross_amount || p.amount || 0), 0) || 0
  const totalFees = payouts?.reduce((sum, p) => sum + (p.platform_fee || 0), 0) || 0

  const stats = [
    { name: 'Wallet Balance', value: `$${((wallet?.balance || 0) / 100).toFixed(2)}`, color: 'text-[#00FF94]' },
    { name: 'Total Spent', value: `$${((wallet?.total_spent || 0) / 100).toFixed(2)}`, color: 'text-white' },
    { name: 'Pending Payouts', value: `$${(totalPending / 100).toFixed(2)}`, color: 'text-yellow-400' },
    { name: 'Platform Fees', value: `$${(totalFees / 100).toFixed(2)}`, color: 'text-gray-400' },
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

  const getTxTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-400'
      case 'payout_deduct': return 'text-red-400'
      case 'refund': return 'text-blue-400'
      case 'withdrawal': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Earnings & Wallet</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <p className="text-gray-400 text-sm">{stat.name}</p>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Wallet Actions */}
      <WalletPanel balance={wallet?.balance || 0} />

      {/* Wallet Transaction History */}
      {transactions && transactions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Wallet Activity</h2>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#111]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#1f1f1f]">
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-3 text-sm font-medium ${getTxTypeColor(tx.type)}`}>
                      {tx.type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-300">{tx.description || '-'}</td>
                    <td className={`px-6 py-3 text-sm font-medium ${tx.type === 'deposit' || tx.type === 'refund' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}${((tx.amount || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-sm text-white">${((tx.balance_after || 0) / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payout History */}
      <h2 className="text-xl font-semibold mb-4">Payout History</h2>
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#111]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Listing</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Gross</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fee (7%)</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Setter Gets</th>
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
                <td className="px-6 py-4 text-white font-medium">${((payout.gross_amount || payout.amount || 0) / 100).toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-400">${((payout.platform_fee || 0) / 100).toFixed(2)}</td>
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
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
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
