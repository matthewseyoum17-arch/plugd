import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppointmentsClient } from './_components/AppointmentsClient'

export const dynamic = 'force-dynamic'

export default async function Appointments() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wallet } = await supabase
    .from('founder_wallets')
    .select('balance')
    .eq('founder_id', user.id)
    .single()

  const { data: listings } = await supabase
    .from('listings')
    .select('title, appointments_used, max_appointments, daily_setter_cap')
    .eq('company_id', user.id)
    .gt('max_appointments', 0)

  const budgets = (listings || []).map((l) => ({
    listing_title: l.title,
    appointments_used: l.appointments_used || 0,
    max_appointments: l.max_appointments || 0,
    daily_setter_cap: l.daily_setter_cap || 3,
  }))

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, listings(id, title, commission_per_appointment, commission_per_close), users!appointments_setter_id_fkey(full_name)')
    .eq('company_id', user.id)
    .order('created_at', { ascending: false })

  const mapped = (appointments || []).map((apt) => {
    const commission = apt.appointment_type === 'close'
      ? apt.listings?.commission_per_close || 0
      : apt.listings?.commission_per_appointment || 0
    const autoApproveAt = apt.submitted_at
      ? new Date(new Date(apt.submitted_at).getTime() + 48 * 60 * 60 * 1000).toISOString()
      : null
    return {
      id: apt.id,
      setter_id: apt.setter_id,
      setter_name: apt.users?.full_name || 'Setter',
      contact_name: apt.contact_name || '',
      contact_company: apt.contact_company || '',
      listing_title: apt.listings?.title || 'N/A',
      appointment_type: apt.appointment_type || 'appointment',
      commission_amount: commission,
      status: apt.status,
      auto_approve_at: autoApproveAt,
      created_at: apt.created_at,
    }
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Appointments</h1>
      <AppointmentsClient appointments={mapped} walletBalance={wallet?.balance || 0} budgets={budgets} />
    </div>
  )
}
