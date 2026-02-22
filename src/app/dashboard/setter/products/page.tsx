import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MyProducts() {
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
    .select('*, listings(*, users!listings_company_id_fkey(full_name))')
    .eq('setter_id', user.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-900/30 text-green-400 border border-green-800'
      case 'pending': return 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
      case 'rejected': return 'bg-red-900/30 text-red-400 border border-red-800'
      default: return 'bg-gray-800/30 text-gray-400 border border-gray-700'
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Products</h1>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#111]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">$/Appt</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">$/Close</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {applications?.map((app) => (
              <tr key={app.id} className="hover:bg-[#1f1f1f]">
                <td className="px-6 py-4 text-white">{app.listings?.title || 'N/A'}</td>
                <td className="px-6 py-4 text-gray-300">{app.listings?.users?.full_name || 'N/A'}</td>
                <td className="px-6 py-4 text-[#00FF94]">${((app.listings?.commission_per_appointment || 0) / 100).toFixed(2)}</td>
                <td className="px-6 py-4 text-[#00FF94]">${((app.listings?.commission_per_close || 0) / 100).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/setter/products/${app.listing_id}/submit`}
                    className="px-3 py-1 bg-[#00FF94] text-black text-xs font-medium rounded-lg hover:bg-[#00cc76] transition-colors"
                  >
                    Submit Appointment
                  </Link>
                </td>
              </tr>
            ))}
            {(!applications || applications.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  You haven&apos;t applied to promote any products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
