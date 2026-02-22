'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitAppointment(formData: FormData): Promise<{ error?: string }> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error in submitAppointment:', authError)
    return { error: 'Not authenticated' }
  }

  const listingId = formData.get('listing_id') as string
  const contactName = formData.get('contact_name') as string
  const contactEmail = formData.get('contact_email') as string
  const contactCompany = formData.get('contact_company') as string
  const calendlyEventUrl = formData.get('calendly_event_url') as string
  const appointmentType = formData.get('appointment_type') as string

  if (!listingId) {
    return { error: 'Please select a listing' }
  }

  // Verify setter has approved application for this listing
  const { data: application } = await supabase
    .from('setter_applications')
    .select('id')
    .eq('setter_id', user.id)
    .eq('listing_id', listingId)
    .eq('status', 'approved')
    .single()

  if (!application) {
    return { error: 'You do not have an approved application for this listing' }
  }

  // Get listing for company_id and commission amounts
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('company_id, commission_per_appointment, commission_per_close')
    .eq('id', listingId)
    .single()

  if (listingError || !listing) {
    console.error('Error fetching listing:', listingError)
    return { error: 'Listing not found' }
  }

  const commissionAmount = appointmentType === 'appointment'
    ? listing.commission_per_appointment || 0
    : listing.commission_per_close || 0

  const autoApproveAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase.from('appointments').insert({
    setter_id: user.id,
    listing_id: listingId,
    company_id: listing.company_id,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_company: contactCompany,
    calendly_event_url: calendlyEventUrl || null,
    appointment_type: appointmentType,
    commission_amount: commissionAmount,
    status: 'submitted',
    auto_approve_at: autoApproveAt,
  })

  if (error) {
    console.error('Error submitting appointment:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/setter/appointments')
  return {}
}
