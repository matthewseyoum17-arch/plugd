import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MyListings() {
  if (!isSupabaseConfigured) redirect("/login");
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listings } = await supabase
    .from('listings')
    .select('*, setter_applications(id, status), appointments(id, status)')
    .eq('company_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Listings</h1>
        <Link
          href="/dashboard/founder/listings/new"
          className="bg-[#00FF94] text-black font-semibold rounded-md px-4 py-2 hover:brightness-90"
        >
          + New Listing
        </Link>
      </div>

      {(!listings || listings.length === 0) && (
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 text-center">
          <p className="text-gray-400">No listings yet. Create your first listing to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings?.map((listing) => {
          const setterCount = listing.setter_applications?.filter((a: { status: string }) => a.status === 'approved').length || 0
          const pendingCount = listing.appointments?.filter((a: { status: string }) => a.status === 'submitted').length || 0
          const statusColor = listing.status === 'active'
            ? 'bg-green-900 text-green-300'
            : listing.status === 'paused'
              ? 'bg-yellow-900 text-yellow-300'
              : 'bg-gray-800 text-gray-400'

          return (
            <div
              key={listing.id}
              className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 hover:border-[#00FF94] transition-all duration-150"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs ${statusColor}`}>
                  {listing.status}
                </span>
              </div>

              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs bg-green-900/50 text-[#00FF94]">
                  ${((listing.commission_per_appointment || 0) / 100).toFixed(2)}/appt
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-green-900/50 text-[#00FF94]">
                  ${((listing.commission_per_close || 0) / 100).toFixed(2)}/close
                </span>
              </div>

              <div className="flex gap-4 mb-4 text-sm">
                <span className="text-gray-400">Setters: <span className="text-white">{setterCount}</span></span>
                <span className="text-gray-400">Pending: <span className="text-yellow-300">{pendingCount}</span></span>
              </div>

              <Link
                href={`/dashboard/founder/listings/${listing.id}/edit`}
                className="border border-[#333] text-white bg-transparent rounded-md px-4 py-2 text-xs hover:bg-[#1a1a1a] inline-block"
              >
                Edit
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
