import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FounderOverview() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role

  if (role !== 'founder') {
    redirect('/dashboard/setter')
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('company_id', user.id)

  const activeListings = listings?.filter(l => l.status === 'active').length || 0

  const { data: applications } = await supabase
    .from('setter_applications')
    .select('*, listings!inner(company_id)')
    .eq('listings.company_id', user.id)
    .eq('status', 'approved')

  const totalSetters = new Set(applications?.map(a => a.setter_id)).size || 0

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('company_id', user.id)
    .in('status', ['submitted', 'confirmed', 'auto_approved'])

  const pendingAppointments = appointments?.length || 0

  const { data: payouts } = await supabase
    .from('payouts')
    .select('amount')
    .eq('founder_id', user.id)
    .eq('status', 'paid')

  const totalPaidOut = (payouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0) / 100

  const stats = [
    { name: 'Active Listings', value: activeListings },
    { name: 'Setters Promoting', value: totalSetters },
    { name: 'Pending Appointments', value: pendingAppointments },
    { name: 'Total Paid Out', value: `$${totalPaidOut.toFixed(2)}` },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <p className="text-gray-400 text-sm">{stat.name}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-400">No recent activity yet.</p>
      </div>
    </div>
  )
}
