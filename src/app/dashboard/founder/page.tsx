import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function FounderOverview() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  const { data: allAppointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('company_id', user.id)

  const pendingAppointments = allAppointments?.filter(a => a.status === 'submitted').length || 0

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

  // Recent activity: last 5 appointments, else last 5 applications, else empty
  const { data: recentAppointments } = await supabase
    .from('appointments')
    .select('*, listings(title), users!appointments_setter_id_fkey(full_name)')
    .eq('company_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentApplications } = await supabase
    .from('setter_applications')
    .select('*, listings!inner(title, company_id), users!setter_applications_setter_id_fkey(full_name)')
    .eq('listings.company_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const hasAppointments = recentAppointments && recentAppointments.length > 0
  const hasApplications = recentApplications && recentApplications.length > 0
  const hasListings = listings && listings.length > 0

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
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

        {hasAppointments ? (
          <div className="divide-y divide-[#222]">
            {recentAppointments.map((apt) => {
              const statusColor: Record<string, string> = {
                submitted: 'bg-yellow-900 text-yellow-300',
                confirmed: 'bg-green-900 text-green-300',
                disputed: 'bg-red-900 text-red-300',
                auto_approved: 'bg-blue-900 text-blue-300',
              }
              return (
                <div key={apt.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">
                      <span className="text-gray-400">{apt.users?.full_name || 'Setter'}</span> submitted appointment for{' '}
                      <span className="font-medium">{apt.listings?.title || 'listing'}</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">{new Date(apt.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${statusColor[apt.status] || 'bg-gray-800 text-gray-400'}`}>
                    {apt.status.replace('_', ' ')}
                  </span>
                </div>
              )
            })}
          </div>
        ) : hasApplications ? (
          <div className="divide-y divide-[#222]">
            {recentApplications.map((app) => {
              const statusColor: Record<string, string> = {
                pending: 'bg-yellow-900 text-yellow-300',
                approved: 'bg-green-900 text-green-300',
                rejected: 'bg-red-900 text-red-300',
              }
              return (
                <div key={app.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">
                      <span className="text-gray-400">{app.users?.full_name || 'Setter'}</span> applied to promote{' '}
                      <span className="font-medium">{app.listings?.title || 'listing'}</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">{new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${statusColor[app.status] || 'bg-gray-800 text-gray-400'}`}>
                    {app.status}
                  </span>
                </div>
              )
            })}
          </div>
        ) : hasListings ? (
          <p className="text-gray-400">No activity yet — share your listing to start getting setters.</p>
        ) : (
          <p className="text-gray-400">
            <Link href="/dashboard/founder/listings/new" className="text-[#00FF94] hover:underline">
              Create your first listing
            </Link>{' '}
            to get started.
          </p>
        )}
      </div>
    </div>
  )
}
