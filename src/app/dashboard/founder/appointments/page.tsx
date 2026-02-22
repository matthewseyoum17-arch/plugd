import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppointmentTabs } from './_components/AppointmentTabs'

export default async function Appointments() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role

  if (role !== 'founder') {
    redirect('/dashboard/setter')
  }

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, listings(id, title, commission_per_appointment, commission_per_close), setter_profiles(setter_id, users!setter_profiles_setter_id_fkey(full_name))')
    .eq('company_id', user.id)
    .order('submitted_at', { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Appointments</h1>
      <AppointmentTabs appointments={appointments || []} />
    </div>
  )
}
