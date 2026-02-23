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
    .select('listing_id, listings(id, title, company_id, commission_per_appointment, commission_per_close)')
    .eq('setter_id', user.id)
    .eq('status', 'approved')

  const { data: approvedApps } = await supabase
    .from('setter_applications')
    .select('listing_id, listings(id, title, company_id, commission_per_appointment, commission_per_close)')
    .eq('setter_id', user.id)
    .eq('status', 'approved')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">Appointments</h1>
        <p className="text-gray-400 mt-2 font-medium">Track the status of appointments you've submitted to founders.</p>
      </div>
      <SetterAppointmentTabs appointments={appointments || []} approvedListings={approvedApps || []} />
    </div>
  )
}
