'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function applyToListing(listingId: string, sampleEmail: string): Promise<{ error?: string }> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error in applyToListing:', authError)
    return { error: 'Not authenticated' }
  }

  // Skip if already applied
  const { data: existing } = await supabase
    .from('setter_applications')
    .select('id')
    .eq('setter_id', user.id)
    .eq('listing_id', listingId)
    .single()

  if (existing) {
    return { error: 'Already applied' }
  }

  const { error } = await supabase
    .from('setter_applications')
    .insert({
      setter_id: user.id,
      listing_id: listingId,
      sample_email: sampleEmail,
      status: 'pending',
    })

  if (error) {
    console.error('Error applying to listing:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/setter/browse')
  return {}
}
