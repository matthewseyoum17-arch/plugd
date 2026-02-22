import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SetterEarnings() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: payouts } = await supabase
    .from('payouts')
    .select('*, appointments(contact_name, listings(title))')
    .eq('setter_id', user.id)
    .order('created_at', { ascending: false })

  const paidPayouts = payouts?.filter(p => p.status === 'paid') || []
  const pendingPayouts = payouts?.filter(p => p.status === 'pending') || []

  // After 7% fee
  const totalEarned = paidPayouts.reduce((sum, p) => {
    const fee = Math.round((p.amount || 0) * 0.07)
    return sum + ((p.amount || 0) - fee)
  }, 0) / 100

  const totalPending = pendingPayouts.reduce((sum, p) => {
    const fee = Math.round((p.amount || 0) * 0.07)
    return sum + ((p.amount || 0) - fee)
  }, 0) / 100

  const statusColor: Record<string, string> = {
    paid: 'bg-green-900 text-green-300',
    pending: 'bg-yellow-900 text-yellow-300',
    processing: 'bg-blue-900 text-blue-300',
    failed: 'bg-red-900 text-red-300',
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5">
          <p className="text-gray-400 text-sm">Total Earned</p>
          <p className="text-3xl font-bold mt-2 text-[#00FF94]">${totalEarned.toFixed(2)}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-3xl font-bold mt-2 text-yellow-300">${totalPending.toFixed(2)}</p>
        </div>
      </div>

      {(!payouts || payouts.length === 0) ? (
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 text-center">
          <p className="text-gray-400">No payouts yet. Submit appointments and get confirmed to start earning.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payouts.map((payout) => {
            const fee = Math.round((payout.amount || 0) * 0.07)
            const netAmount = ((payout.amount || 0) - fee) / 100
            return (
              <div key={payout.id} className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 flex items-center justify-between hover:border-[#00FF94] transition-all duration-150">
                <div>
                  <p className="text-white font-medium">{payout.appointments?.listings?.title || 'N/A'}</p>
                  <p className="text-gray-400 text-sm">{payout.appointments?.contact_name || ''}</p>
                  <p className="text-gray-500 text-xs mt-1">{new Date(payout.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#00FF94] font-semibold">${netAmount.toFixed(2)}</p>
                  <p className="text-gray-500 text-xs">7% fee: ${(fee / 100).toFixed(2)}</p>
                  <span className={`px-3 py-1 rounded-full text-xs mt-1 inline-block ${statusColor[payout.status] || 'bg-gray-800 text-gray-400'}`}>
                    {payout.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
