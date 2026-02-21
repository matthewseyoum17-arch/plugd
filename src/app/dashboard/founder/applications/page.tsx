import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ApplicationActions } from './_components/ApplicationActions'

export default async function Applications() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role

  if (role !== 'founder') {
    redirect('/dashboard/setter')
  }

  const { data: applications } = await supabase
    .from('setter_applications')
    .select('*, listings(title), setter_profiles(setter_id, users!setter_profiles_setter_id_fkey(full_name, email))')
    .eq('listings.company_id', user.id)
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
      <h1 className="text-3xl font-bold mb-8">Setter Applications</h1>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#111]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Setter</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Listing</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applied</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {applications?.map((app) => (
              <tr key={app.id} className="hover:bg-[#1f1f1f]">
                <td className="px-6 py-4">
                  <div className="text-sm text-white">{app.setter_profiles?.users?.full_name || 'Unknown'}</div>
                  <div className="text-xs text-gray-500">{app.setter_profiles?.users?.email}</div>
                </td>
                <td className="px-6 py-4 text-gray-300">{app.listings?.title || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <ApplicationActions
                    applicationId={app.id}
                    setterName={app.setter_profiles?.users?.full_name || 'Unknown'}
                    listingTitle={app.listings?.title || ''}
                    currentStatus={app.status}
                  />
                </td>
              </tr>
            ))}
            {(!applications || applications.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
