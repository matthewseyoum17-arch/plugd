import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SetterOverview() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role

  if (role !== 'setter') {
    redirect('/dashboard/founder')
  }

  const { data: applications } = await supabase
    .from('setter_applications')
    .select('*, listings(title, company_name)')
    .eq('setter_id', user.id)
    .eq('status', 'approved')

  const activePromotions = applications?.length || 0

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('setter_id', user.id)

  const appointmentsSubmitted = appointments?.length || 0

  const { data: payouts } = await supabase
    .from('payouts')
    .select('amount')
    .eq('setter_id', user.id)
    .eq('status', 'paid')

  const totalEarned = (payouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0) / 100

  const stats = [
    { name: 'Active Promotions', value: activePromotions },
    { name: 'Appointments Submitted', value: appointmentsSubmitted },
    { name: 'Total Earned', value: `$${totalEarned.toFixed(2)}` },
    { name: 'Quality Score', value: 'N/A' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6"
          >
            <p className="text-gray-400 text-sm">{stat.name}</p>
            <p className="text-3xl font-bold mt-2 text-[#00FF94]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-400">No recent activity yet.</p>
      </div>
    </div>
  )
}
