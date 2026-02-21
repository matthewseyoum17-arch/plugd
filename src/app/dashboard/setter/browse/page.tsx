import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ApplyButton } from './_components/ApplyButton'

export default async function BrowseListings() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role

  if (role !== 'setter') {
    redirect('/dashboard/founder')
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('*, founder_profiles(company_name)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const { data: userApplications } = await supabase
    .from('setter_applications')
    .select('listing_id')
    .eq('setter_id', user.id)

  const appliedListingIds = new Set(userApplications?.map(app => app.listing_id) || [])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Browse Listings</h1>
        <div className="flex gap-4">
          <select className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-lg focus:ring-[#00FF94] focus:border-[#00FF94] block p-2.5">
            <option value="">All Categories</option>
            <option value="saas">SaaS</option>
            <option value="agency">Agency</option>
            <option value="coaching">Coaching</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings?.map((listing) => (
          <div key={listing.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
                <p className="text-sm text-gray-400">{listing.founder_profiles?.company_name}</p>
              </div>
              <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full border border-green-800">
                active
              </span>
            </div>
            
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{listing.description}</p>
            
            {listing.ideal_customer && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Ideal Customer</p>
                <p className="text-sm text-gray-300">{listing.ideal_customer}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">$/Appointment</p>
                <p className="text-[#00FF94] font-semibold">${((listing.commission_per_appointment || 0) / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">$/Close</p>
                <p className="text-[#00FF94] font-semibold">${((listing.commission_per_close || 0) / 100).toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-auto pt-4">
              {appliedListingIds.has(listing.id) ? (
                <button
                  disabled
                  className="block w-full py-2 text-center bg-[#2a2a2a] text-gray-400 font-medium rounded-lg cursor-not-allowed"
                >
                  Applied
                </button>
              ) : (
                <ApplyButton listingId={listing.id} />
              )}
            </div>
          </div>
        ))}
        {(!listings || listings.length === 0) && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No active listings available.
          </div>
        )}
      </div>
    </div>
  )
}
