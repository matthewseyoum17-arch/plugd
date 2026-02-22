import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StatusToggle } from './_components/StatusToggle'

export default async function MyListings() {
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
    .select('*, setter_applications(setter_id), appointments(id, status)')
    .eq('company_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Listings</h1>
        <Link
          href="/dashboard/founder/listings/new"
          className="px-4 py-2 bg-[#00FF94] text-black font-semibold rounded-lg hover:brightness-90 transition-all"
        >
          + New Listing
        </Link>
      </div>

      {(!listings || listings.length === 0) ? (
        <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-12 text-center">
          <p className="text-gray-500 mb-4">No listings yet — create your first one.</p>
          <Link href="/dashboard/founder/listings/new" className="text-[#00FF94] font-medium hover:underline">
            Create Listing &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => {
            const approvedSetters = listing.setter_applications?.filter((a: { setter_id: string }) => a.setter_id).length || 0
            const pendingAppts = listing.appointments?.filter((a: { status: string }) => a.status === 'submitted').length || 0

            return (
              <div key={listing.id} className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6 hover:border-[#00FF94]/30 transition-all duration-200 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{listing.title}</h3>
                    <p className="text-sm text-gray-500">{listing.company_name}</p>
                  </div>
                  <StatusBadge status={listing.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#111] rounded-lg p-3">
                    <p className="text-xs text-gray-500">$/Appt</p>
                    <p className="text-[#00FF94] font-semibold">${((listing.commission_per_appointment || 0) / 100).toFixed(2)}</p>
                  </div>
                  <div className="bg-[#111] rounded-lg p-3">
                    <p className="text-xs text-gray-500">$/Close</p>
                    <p className="text-[#00FF94] font-semibold">${((listing.commission_per_close || 0) / 100).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-5">
                  <span>{approvedSetters} setter{approvedSetters !== 1 ? 's' : ''}</span>
                  <span className="text-[#222]">|</span>
                  <span>{pendingAppts} pending appt{pendingAppts !== 1 ? 's' : ''}</span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#222]">
                  <div className="flex items-center gap-2">
                    <StatusToggle listingId={listing.id} currentStatus={listing.status} />
                    <span className="text-xs text-gray-500">{listing.status === 'active' ? 'Active' : 'Paused'}</span>
                  </div>
                  <Link
                    href={`/dashboard/founder/listings/${listing.id}/edit`}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Edit &rarr;
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
