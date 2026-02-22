'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateListing(listingId: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error in updateListing:', authError)
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const idealCustomer = formData.get('ideal_customer') as string
  const productUrl = formData.get('product_url') as string
  const commissionPerAppointment = formData.get('commission_per_appointment') as string
  const commissionPerClose = formData.get('commission_per_close') as string
  const qualifiedMeetingDefinition = formData.get('qualified_meeting_definition') as string
  const pitchKitUrl = formData.get('pitch_kit_url') as string
  const status = formData.get('status') as string

  const { error } = await supabase
    .from('listings')
    .update({
      title,
      description,
      ideal_customer: idealCustomer,
      product_url: productUrl,
      commission_per_appointment: Math.round(parseFloat(commissionPerAppointment || '0') * 100),
      commission_per_close: Math.round(parseFloat(commissionPerClose || '0') * 100),
      qualified_meeting_definition: qualifiedMeetingDefinition,
      pitch_kit_url: pitchKitUrl,
      status: status || 'active',
    })
    .eq('id', listingId)
    .eq('company_id', user.id)

  if (error) {
    console.error('Error updating listing:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/founder/listings')
  redirect('/dashboard/founder/listings')
}
