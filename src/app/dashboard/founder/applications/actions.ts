'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveApplication(applicationId: string): Promise<{ error?: string }> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error in approveApplication:', authError)
    return { error: 'Not authenticated' }
  }

  const { data: owned } = await supabase
    .from('setter_applications')
    .select('listings!inner(company_id)')
    .eq('id', applicationId)
    .eq('listings.company_id', user.id)
    .single()
  if (!owned) return { error: 'Not authorized' }

  const { error } = await supabase
    .from('setter_applications')
    .update({ status: 'approved' })
    .eq('id', applicationId)

  if (error) {
    console.error('Error approving application:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/founder/applications')
  return {}
}

export async function rejectApplication(applicationId: string): Promise<{ error?: string }> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error in rejectApplication:', authError)
    return { error: 'Not authenticated' }
  }

  const { data: owned } = await supabase
    .from('setter_applications')
    .select('listings!inner(company_id)')
    .eq('id', applicationId)
    .eq('listings.company_id', user.id)
    .single()
  if (!owned) return { error: 'Not authorized' }

  const { error } = await supabase
    .from('setter_applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)

  if (error) {
    console.error('Error rejecting application:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/founder/applications')
  return {}
}
