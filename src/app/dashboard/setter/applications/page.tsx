import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SetterApplicationsList } from './_components/SetterApplicationsList'

export const dynamic = 'force-dynamic'

export default async function SetterApplications() {
  if (!isSupabaseConfigured) redirect("/login");
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: applications } = await supabase
    .from('setter_applications')
    .select('*, listings(title, company_name, company_id)')
    .eq('setter_id', user.id)
    .order('created_at', { ascending: false })

  const mapped = (applications || []).map((app) => ({
    id: app.id,
    listing_title: (app.listings as { title?: string })?.title || 'Unknown Listing',
    company_name: (app.listings as { company_name?: string })?.company_name || 'Company',
    company_id: (app.listings as { company_id?: string })?.company_id || '',
    status: app.status,
    created_at: app.created_at,
  }))

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Applications</h1>
      <SetterApplicationsList applications={mapped} />
    </div>
  )
}
