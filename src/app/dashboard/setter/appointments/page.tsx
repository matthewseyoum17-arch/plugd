import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SetterAppointmentTabs } from './_components/SetterAppointmentTabs'

export default async function SetterAppointments() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role

  if (role !== 'setter') {
    redirect('/dashboard/founder')
  }

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, listings(title, commission_per_appointment, commission_per_close)')
    .eq('setter_id', user.id)
    .order('submitted_at', { ascending: false })

  const { data: approvedApps } = await supabase
    .from('setter_applications')
    .select('listing_id, listings(id, title, company_id, commission_per_appointment, commission_per_close)')
    .eq('setter_id', user.id)
    .eq('status', 'approved')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Appointments</h1>
      <SetterAppointmentTabs appointments={appointments || []} approvedListings={approvedApps || []} />
    </div>
  )
}
