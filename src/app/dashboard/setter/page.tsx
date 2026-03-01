import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/ui/StatCard'

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">Overview</h1>
        <p className="text-gray-400 mt-2 font-medium">Welcome back to Plugd. Here&apos;s your performance snapshot.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.name} label={stat.name} value={stat.value} />
        ))}
      </div>

      <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-heading font-semibold text-white mb-4">Recent Activity</h2>
        <div className="py-12 text-center border-2 border-dashed border-white/10 rounded-xl bg-white/5">
          <p className="text-gray-400 font-medium">No recent activity yet.</p>
        </div>
      </div>
    </div>
  )
}
