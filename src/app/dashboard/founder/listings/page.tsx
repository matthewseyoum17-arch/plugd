import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
    .select('*, setter_applications(setter_id)')
    .eq('company_id', user.id)
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/30 text-green-400 border border-green-800'
      case 'paused': return 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
      case 'closed': return 'bg-gray-800/30 text-gray-400 border border-gray-700'
      default: return 'bg-gray-800/30 text-gray-400 border border-gray-700'
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Listings</h1>
        <Link
          href="/dashboard/founder/listings/new"
          className="px-4 py-2 bg-[#00FF94] text-black font-medium rounded-lg hover:bg-[#00cc76] transition-colors"
        >
          + New Listing
        </Link>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#111]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">$/Appt</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">$/Close</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Setters</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {listings?.map((listing) => (
              <tr key={listing.id} className="hover:bg-[#1f1f1f]">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{listing.title}</div>
                  <div className="text-sm text-gray-400">{listing.company_name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(listing.status)}`}>
                    {listing.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">${((listing.commission_per_appointment || 0) / 100).toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-300">${((listing.commission_per_close || 0) / 100).toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-300">{listing.setter_applications?.length || 0}</td>
              </tr>
            ))}
            {(!listings || listings.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No listings yet. Create your first listing to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
