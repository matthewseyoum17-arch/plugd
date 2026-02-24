import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BrowseClient } from './_components/BrowseClient'

export default async function BrowseListings() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const { data: userApplications } = await supabase
    .from('setter_applications')
    .select('listing_id')
    .eq('setter_id', user.id)

  const appliedIds = userApplications?.map((app) => app.listing_id) || []

  const mapped = (listings || []).map((l) => ({
    id: l.id,
    title: l.title,
    description: l.description,
    ideal_customer: l.ideal_customer,
    commission_per_appointment: l.commission_per_appointment || 0,
    commission_per_close: l.commission_per_close || 0,
    company_name: l.company_name || 'Company',
  }))

  return <BrowseClient listings={mapped} appliedIds={appliedIds} />
}
