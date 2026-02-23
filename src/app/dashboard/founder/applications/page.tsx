import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ApplicationCard } from './_components/ApplicationCard'

export default async function Applications() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myListings } = await supabase
    .from('listings')
    .select('id')
    .eq('company_id', user.id)

  const myListingIds = (myListings || []).map(l => l.id)

  const { data: applications } = myListingIds.length
    ? await supabase
        .from('setter_applications')
        .select('*, listings(id, title), users!setter_applications_setter_id_fkey(full_name, email)')
        .in('listing_id', myListingIds)
        .order('created_at', { ascending: false })
    : { data: [] as any[] }

  // Group by listing
  const grouped: Record<string, { title: string; apps: typeof applications }> = {}
  for (const app of applications || []) {
    const listingId = app.listings?.id || app.listing_id
    const listingTitle = app.listings?.title || 'Unknown Listing'
    if (!grouped[listingId]) {
      grouped[listingId] = { title: listingTitle, apps: [] }
    }
    grouped[listingId].apps!.push(app)
  }

  const hasApplications = Object.keys(grouped).length > 0

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Setter Applications</h1>

      {!hasApplications && (
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 text-center">
          <p className="text-gray-400">No applications yet — share your listing to start getting setters.</p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([listingId, { title, apps }]) => (
          <div key={listingId} className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5">
            <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
            <div className="divide-y divide-[#222]">
              {apps!.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={{
                    id: app.id,
                    status: app.status,
                    sample_email: app.sample_email,
                    created_at: app.created_at,
                    setter_id: app.setter_id,
                    setter_name: app.users?.full_name || 'Unknown',
                    setter_email: app.users?.email || '',
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
