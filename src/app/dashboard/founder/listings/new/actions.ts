'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createListing(formData: FormData): Promise<{ error: string } | undefined> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Auth error in createListing:', authError)
    return { error: 'You must be logged in' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const idealCustomer = formData.get('ideal_customer') as string
  const productUrl = formData.get('product_url') as string
  const commissionPerAppointment = formData.get('commission_per_appointment') as string
  const commissionPerClose = formData.get('commission_per_close') as string
  const qualifiedMeetingDefinition = formData.get('qualified_meeting_definition') as string
  const pitchKitUrl = formData.get('pitch_kit_url') as string

  const { data: founderProfile } = await supabase
    .from('founder_profiles')
    .select('company_name')
    .eq('founder_id', user.id)
    .single()

  const { error: insertError } = await supabase.from('listings').insert({
    company_id: user.id,
    title,
    description,
    ideal_customer: idealCustomer,
    product_url: productUrl,
    commission_per_appointment: Math.round(parseFloat(commissionPerAppointment || '0') * 100),
    commission_per_close: Math.round(parseFloat(commissionPerClose || '0') * 100),
    qualified_meeting_definition: qualifiedMeetingDefinition,
    pitch_kit_url: pitchKitUrl,
    company_name: founderProfile?.company_name || 'My Company',
    status: 'active',
  })

  if (insertError) {
    console.error('Error creating listing:', insertError)
    return { error: insertError.message }
  }

  redirect('/dashboard/founder/listings')
}
