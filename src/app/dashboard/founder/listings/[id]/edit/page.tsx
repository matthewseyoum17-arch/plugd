import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EditForm } from './EditForm'

export default async function EditListing({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .eq('company_id', user.id)
    .single()

  if (error || !listing) {
    console.error('Error fetching listing for edit:', error)
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Listing</h1>
      <EditForm listing={listing} />
    </div>
  )
}
