import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppointmentsClient } from './_components/AppointmentsClient'

export default async function SetterAppointments() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get approved listings for the submit form
  const { data: approvedApps } = await supabase
    .from('setter_applications')
    .select('listing_id, listings(title, commission_per_appointment, commission_per_close)')
    .eq('setter_id', user.id)
    .eq('status', 'approved')

  const approvedListings = (approvedApps || []).map((app) => {
    const listing = app.listings as unknown as { title: string; commission_per_appointment: number; commission_per_close: number } | null
    return {
      listing_id: app.listing_id,
      title: listing?.title || 'Unknown',
      commission_per_appointment: listing?.commission_per_appointment || 0,
      commission_per_close: listing?.commission_per_close || 0,
    }
  })

  // Get setter's appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, listings(title)')
    .eq('setter_id', user.id)
    .order('created_at', { ascending: false })

  const mapped = (appointments || []).map((apt) => ({
    id: apt.id,
    listing_title: apt.listings?.title || 'N/A',
    contact_name: apt.contact_name || '',
    commission_amount: apt.commission_amount || 0,
    status: apt.status,
    auto_approve_at: apt.auto_approve_at,
    created_at: apt.created_at,
  }))

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Appointments</h1>
      <AppointmentsClient approvedListings={approvedListings} appointments={mapped} />
    </div>
  )
}
