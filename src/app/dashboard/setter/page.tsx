import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SetterOverview() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: allApplications } = await supabase
    .from('setter_applications')
    .select('id, status')
    .eq('setter_id', user.id)

  const applicationsSent = allApplications?.length || 0
  const approvedCount = allApplications?.filter(a => a.status === 'approved').length || 0

  const { data: allAppointments } = await supabase
    .from('appointments')
    .select('id')
    .eq('setter_id', user.id)

  const appointmentsSubmitted = allAppointments?.length || 0

  const { data: payouts } = await supabase
    .from('payouts')
    .select('amount')
    .eq('setter_id', user.id)
    .eq('status', 'paid')

  const totalEarned = (payouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0) / 100

  const stats = [
    { name: 'Applications Sent', value: applicationsSent },
    { name: 'Approved', value: approvedCount },
    { name: 'Appointments Submitted', value: appointmentsSubmitted },
    { name: 'Total Earned', value: `$${totalEarned.toFixed(2)}` },
  ]

  // Recent 3 appointments with listing commission data
  const { data: recentAppointments } = await supabase
    .from('appointments')
    .select('*, listings(title, commission_per_appointment, commission_per_close)')
    .eq('setter_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const statusColor: Record<string, string> = {
    submitted: 'bg-yellow-900 text-yellow-300',
    confirmed: 'bg-green-900 text-green-300',
    disputed: 'bg-red-900 text-red-300',
    auto_approved: 'bg-blue-900 text-blue-300',
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5"
          >
            <p className="text-gray-400 text-sm">{stat.name}</p>
            <p className="text-3xl font-bold mt-2 text-[#00FF94]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-[#1a1a1a] border border-[#222] rounded-lg p-5">
        <h2 className="text-xl font-semibold mb-4">Recent Appointments</h2>

        {recentAppointments && recentAppointments.length > 0 ? (
          <div className="divide-y divide-[#222]">
            {recentAppointments.map((apt) => (
              <div key={apt.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{apt.listings?.title || 'N/A'}</p>
                  <p className="text-gray-400 text-sm">Contact: {apt.contact_name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{new Date(apt.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs ${statusColor[apt.status] || 'bg-gray-800 text-gray-400'}`}>
                    {apt.status.replace('_', ' ')}
                  </span>
                  {(() => {
                    const commission = apt.appointment_type === 'close'
                      ? apt.listings?.commission_per_close || 0
                      : apt.listings?.commission_per_appointment || 0
                    return commission > 0
                      ? <p className="text-[#00FF94] text-sm font-medium mt-1">${(commission / 100).toFixed(2)}</p>
                      : null
                  })()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No appointments yet. Browse listings and start promoting.</p>
        )}
      </div>
    </div>
  )
}
