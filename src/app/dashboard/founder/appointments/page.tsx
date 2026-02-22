import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppointmentsClient } from './_components/AppointmentsClient'

export default async function Appointments() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, listings(id, title, commission_per_appointment, commission_per_close), users!appointments_setter_id_fkey(full_name)')
    .eq('company_id', user.id)
    .order('created_at', { ascending: false })

  const mapped = (appointments || []).map((apt) => ({
    id: apt.id,
    setter_id: apt.setter_id,
    setter_name: apt.users?.full_name || 'Setter',
    contact_name: apt.contact_name || '',
    contact_company: apt.contact_company || '',
    listing_title: apt.listings?.title || 'N/A',
    appointment_type: apt.appointment_type || 'appointment',
    commission_amount: apt.commission_amount || (apt.appointment_type === 'appointment'
      ? apt.listings?.commission_per_appointment || 0
      : apt.listings?.commission_per_close || 0),
    status: apt.status,
    auto_approve_at: apt.auto_approve_at,
    created_at: apt.created_at,
  }))

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Appointments</h1>
      <AppointmentsClient appointments={mapped} />
    </div>
  )
}
