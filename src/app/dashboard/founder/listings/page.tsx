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
      case 'active': return 'bg-green-900 text-green-300'
      case 'paused': return 'bg-yellow-900 text-yellow-300'
      case 'closed': return 'bg-gray-700 text-gray-300'
      default: return 'bg-gray-700 text-gray-300'
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link
          href="/dashboard/founder/listings/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Create Listing
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Commission/Appointment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Commission/Close</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Setters</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {listings?.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-750">
                <td className="px-6 py-4">
                  <div className="font-medium">{listing.title}</div>
                  <div className="text-sm text-gray-400">{listing.company_name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(listing.status)}`}>
                    {listing.status}
                  </span>
                </td>
                <td className="px-6 py-4">${((listing.commission_per_appointment || 0) / 100).toFixed(2)}</td>
                <td className="px-6 py-4">${((listing.commission_per_close || 0) / 100).toFixed(2)}</td>
                <td className="px-6 py-4">{listing.setter_applications?.length || 0}</td>
              </tr>
            ))}
            {(!listings || listings.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
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
