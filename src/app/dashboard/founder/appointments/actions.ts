'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function confirmAppointment(
  appointmentId: string
): Promise<{ error?: string }> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error in confirmAppointment:', authError)
    return { error: 'Not authenticated' }
  }

  // Fetch appointment with listing commission data — also verifies ownership
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('id, setter_id, appointment_type, listings(commission_per_appointment, commission_per_close)')
    .eq('id', appointmentId)
    .eq('company_id', user.id)
    .single()

  if (fetchError || !appointment) {
    console.error('Error fetching appointment:', fetchError)
    return { error: 'Appointment not found or not authorized' }
  }

  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', appointmentId)
    .eq('company_id', user.id)

  if (updateError) {
    console.error('Error confirming appointment:', updateError)
    return { error: updateError.message }
  }

  const listing = appointment.listings as unknown as { commission_per_appointment: number; commission_per_close: number } | null
  const grossCommission = appointment.appointment_type === 'close'
    ? listing?.commission_per_close || 0
    : listing?.commission_per_appointment || 0
  const feeRate = appointment.appointment_type === 'close' ? 0.05 : 0.07
  const amount = Math.round(grossCommission * (1 - feeRate))

  const { error: payoutError } = await supabase
    .from('payouts')
    .insert({
      founder_id: user.id,
      setter_id: appointment.setter_id,
      appointment_id: appointmentId,
      amount,
      status: 'pending',
    })

  if (payoutError) {
    console.error('Error creating payout:', payoutError)
    return { error: payoutError.message }
  }

  revalidatePath('/dashboard/founder/appointments')
  return {}
}

export async function disputeAppointment(appointmentId: string): Promise<{ error?: string }> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error in disputeAppointment:', authError)
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'disputed' })
    .eq('id', appointmentId)
    .eq('company_id', user.id)

  if (error) {
    console.error('Error disputing appointment:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/founder/appointments')
  return {}
}
