import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SetterApplications() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: applications } = await supabase
    .from('setter_applications')
    .select('*, listings(title, company_name)')
    .eq('setter_id', user.id)
    .order('created_at', { ascending: false })

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-900 text-yellow-300',
    approved: 'bg-green-900 text-green-300',
    rejected: 'bg-red-900 text-red-300',
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Applications</h1>

      {(!applications || applications.length === 0) ? (
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 text-center">
          <p className="text-gray-400">No applications yet. Browse listings to start promoting.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 flex items-center justify-between hover:border-[#00FF94] transition-all duration-150">
              <div>
                <p className="text-white font-medium">{app.listings?.title || 'Unknown Listing'}</p>
                <p className="text-gray-400 text-sm">{app.listings?.company_name || 'Company'}</p>
                <p className="text-gray-500 text-xs mt-1">Applied {new Date(app.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${statusColor[app.status] || 'bg-gray-800 text-gray-400'}`}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
