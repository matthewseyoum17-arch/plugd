import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BrowseGrid } from './_components/BrowseGrid'

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
    .select('*, founder_profiles(company_name, verified)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const { data: userApplications } = await supabase
    .from('setter_applications')
    .select('listing_id')
    .eq('setter_id', user.id)

  const appliedIds = userApplications?.map(app => app.listing_id) || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">Browse Products</h1>
        <p className="text-gray-400 mt-2 font-medium">Discover high-ticket SaaS products to promote and earn commissions.</p>
      </div>
      <BrowseGrid listings={listings || []} appliedIds={appliedIds} />
    </div>
  )
}
