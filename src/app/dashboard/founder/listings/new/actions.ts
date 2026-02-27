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
  const categoryId = formData.get('category_id') as string
  const coverImageUrl = formData.get('cover_image_url') as string
  const tagsRaw = formData.get('tags') as string
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : null
  const maxAppointments = formData.get('max_appointments') as string
  const dailySetterCap = formData.get('daily_setter_cap') as string
  const maxSetters = formData.get('max_setters') as string

  // Validate minimum commission ($25)
  const commissionCents = Math.round(parseFloat(commissionPerAppointment || '0') * 100)
  if (commissionCents < 2500) {
    return { error: 'Minimum commission per appointment is $25.00' }
  }

  // Fetch company name from founder profile
  const { data: profile } = await supabase
    .from('founder_profiles')
    .select('company_name')
    .eq('founder_id', user.id)
    .single()

  const { error: insertError } = await supabase.from('listings').insert({
    company_id: user.id,
    company_name: profile?.company_name || '',
    title,
    description,
    ideal_customer: idealCustomer,
    product_url: productUrl,
    commission_per_appointment: commissionCents,
    commission_per_close: Math.round(parseFloat(commissionPerClose || '0') * 100),
    qualified_meeting_definition: qualifiedMeetingDefinition,
    pitch_kit_url: pitchKitUrl,
    category_id: categoryId || null,
    cover_image_url: coverImageUrl || null,
    tags: tags,
    max_appointments: parseInt(maxAppointments || '0', 10),
    daily_setter_cap: parseInt(dailySetterCap || '3', 10),
    max_setters: parseInt(maxSetters || '5', 10),
    appointments_used: 0,
    status: 'active',
  })

  if (insertError) {
    console.error('Error creating listing:', insertError)
    return { error: insertError.message }
  }

  redirect('/dashboard/founder/listings')
}
