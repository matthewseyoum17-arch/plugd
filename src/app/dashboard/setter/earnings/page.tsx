import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WithdrawalPanel } from './_components/WithdrawalPanel'

export const dynamic = 'force-dynamic'

export default async function SetterEarnings() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date().toISOString()

  const { data: payouts } = await supabase
    .from('payouts')
    .select('*, appointments(contact_name, listings(title))')
    .eq('setter_id', user.id)
    .order('created_at', { ascending: false })

  const { data: withdrawals } = await supabase
    .from('setter_withdrawals')
    .select('*')
    .eq('setter_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const paidPayouts = payouts?.filter(p => p.status === 'paid') || []
  const pendingPayouts = payouts?.filter(p => p.status === 'pending') || []
  const clearedPayouts = pendingPayouts.filter(p => p.clears_at && new Date(p.clears_at) <= new Date(now))
  const clearingPayouts = pendingPayouts.filter(p => !p.clears_at || new Date(p.clears_at) > new Date(now))

  const totalEarned = paidPayouts.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalCleared = clearedPayouts.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalClearing = clearingPayouts.reduce((sum, p) => sum + (p.amount || 0), 0)

  const pendingWithdrawals = (withdrawals || [])
    .filter(w => w.status === 'pending' || w.status === 'processing')
    .reduce((sum, w) => sum + (w.amount || 0), 0)
  const completedWithdrawals = (withdrawals || [])
    .filter(w => w.status === 'paid')
    .reduce((sum, w) => sum + (w.amount || 0), 0)

  const availableBalance = totalEarned + totalCleared - pendingWithdrawals - completedWithdrawals

  const statusColor: Record<string, string> = {
    paid: 'bg-green-900 text-green-300',
    pending: 'bg-yellow-900 text-yellow-300',
    processing: 'bg-blue-900 text-blue-300',
    failed: 'bg-red-900 text-red-300',
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5">
          <p className="text-gray-400 text-sm">Available to Withdraw</p>
          <p className="text-3xl font-bold mt-2 text-[#ffffff]">${(Math.max(0, availableBalance) / 100).toFixed(2)}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5">
          <p className="text-gray-400 text-sm">Clearing (14 days)</p>
          <p className="text-3xl font-bold mt-2 text-yellow-300">${(totalClearing / 100).toFixed(2)}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5">
          <p className="text-gray-400 text-sm">Total Earned</p>
          <p className="text-3xl font-bold mt-2 text-white">${((totalEarned + totalCleared + totalClearing) / 100).toFixed(2)}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5">
          <p className="text-gray-400 text-sm">Withdrawn</p>
          <p className="text-3xl font-bold mt-2 text-gray-400">${(completedWithdrawals / 100).toFixed(2)}</p>
        </div>
      </div>

      {/* Withdrawal Panel */}
      <WithdrawalPanel availableBalance={Math.max(0, availableBalance)} />

      {/* Payout History */}
      <h2 className="text-xl font-semibold mb-4">Payout History</h2>
      {(!payouts || payouts.length === 0) ? (
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 text-center">
          <p className="text-gray-400">No payouts yet. Submit appointments and get confirmed to start earning.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {payouts.map((payout) => {
            const displayAmount = (payout.amount || 0) / 100
            const isClearing = payout.clears_at && new Date(payout.clears_at) > new Date()
            const clearsDate = payout.clears_at ? new Date(payout.clears_at) : null
            const daysLeft = clearsDate ? Math.max(0, Math.ceil((clearsDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0

            return (
              <div key={payout.id} className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 flex items-center justify-between hover:border-[#ffffff] transition-all duration-150">
                <div>
                  <p className="text-white font-medium">{payout.appointments?.listings?.title || 'N/A'}</p>
                  <p className="text-gray-400 text-sm">{payout.appointments?.contact_name || ''}</p>
                  <p className="text-gray-500 text-xs mt-1">{new Date(payout.created_at).toLocaleDateString()}</p>
                  {isClearing && payout.status === 'pending' && (
                    <p className="text-yellow-400 text-xs mt-1">
                      Clears in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                    </p>
                  )}
                  {payout.platform_fee > 0 && (
                    <p className="text-gray-600 text-xs mt-0.5">
                      Fee: ${((payout.platform_fee || 0) / 100).toFixed(2)} (7%)
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[#ffffff] font-semibold">${displayAmount.toFixed(2)}</p>
                  {payout.gross_amount > 0 && payout.gross_amount !== payout.amount && (
                    <p className="text-gray-500 text-xs line-through">${((payout.gross_amount || 0) / 100).toFixed(2)}</p>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs mt-1 inline-block ${statusColor[payout.status] || 'bg-gray-800 text-gray-400'}`}>
                    {isClearing && payout.status === 'pending' ? 'clearing' : payout.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Withdrawal History */}
      {withdrawals && withdrawals.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Withdrawal History</h2>
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div key={w.id} className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Withdrawal Request</p>
                  <p className="text-gray-500 text-xs">{new Date(w.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">${((w.amount || 0) / 100).toFixed(2)}</p>
                  <span className={`px-3 py-1 rounded-full text-xs mt-1 inline-block ${statusColor[w.status] || 'bg-gray-800 text-gray-400'}`}>
                    {w.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
