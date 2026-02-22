'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function confirmAppointment(
  appointmentId: string,
  setterId: string,
  commissionAmount: number
): Promise<{ error?: string }> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error in confirmAppointment:', authError)
    return { error: 'Not authenticated' }
  }

  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', appointmentId)

  if (updateError) {
    console.error('Error confirming appointment:', updateError)
    return { error: updateError.message }
  }

  const platformFee = Math.round(commissionAmount * 0.07)

  const { error: payoutError } = await supabase
    .from('payouts')
    .insert({
      founder_id: user.id,
      setter_id: setterId,
      appointment_id: appointmentId,
      amount: commissionAmount,
      platform_fee: platformFee,
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

  if (error) {
    console.error('Error disputing appointment:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/founder/appointments')
  return {}
}
