'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

interface Listing {
  id: string
  company_id: string
  title: string
  description: string
  ideal_customer: string | null
  product_url: string | null
  commission_per_appointment: number
  commission_per_close: number
  qualified_meeting_definition: string | null
  pitch_kit_url: string | null
  status: string
}

export default function EditListing() {
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toggling, setToggling] = useState(false)

  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const listingId = params.listingId as string

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single()

      if (fetchError || !data) {
        setError('Listing not found')
        setLoading(false)
        return
      }

      if (data.company_id !== user.id) {
        setError('Not authorized')
        setLoading(false)
        return
      }

      setListing(data)
      setLoading(false)
    }
    load()
  }, [router, supabase, listingId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!listing) return
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)

    const { error: updateError } = await supabase
      .from('listings')
      .update({
        title: form.get('title') as string,
        description: form.get('description') as string,
        ideal_customer: form.get('ideal_customer') as string,
        product_url: form.get('product_url') as string,
        commission_per_appointment: Math.round(parseFloat(form.get('commission_per_appointment') as string || '0') * 100),
        commission_per_close: Math.round(parseFloat(form.get('commission_per_close') as string || '0') * 100),
        qualified_meeting_definition: form.get('qualified_meeting_definition') as string,
        pitch_kit_url: form.get('pitch_kit_url') as string,
      })
      .eq('id', listing.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push('/dashboard/founder/listings')
  }

  const toggleStatus = async () => {
    if (!listing) return
    setToggling(true)
    const newStatus = listing.status === 'active' ? 'paused' : 'active'

    const { error: toggleError } = await supabase
      .from('listings')
      .update({ status: newStatus })
      .eq('id', listing.id)

    if (toggleError) {
      setError(toggleError.message)
    } else {
      setListing({ ...listing, status: newStatus })
    }
    setToggling(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-red-400">{error || 'Listing not found'}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Listing</h1>
        <button
          onClick={toggleStatus}
          disabled={toggling}
          className={`px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 ${
            listing.status === 'active'
              ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800'
              : 'bg-green-900 text-green-300 hover:bg-green-800'
          }`}
        >
          {toggling ? 'Updating...' : listing.status === 'active' ? 'Pause Listing' : 'Activate Listing'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Product Title *</label>
          <input
            type="text"
            name="title"
            defaultValue={listing.title}
            className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#00FF94] focus:outline-none w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
          <textarea
            name="description"
            defaultValue={listing.description}
            className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#00FF94] focus:outline-none w-full h-32"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Ideal Customer</label>
          <input
            type="text"
            name="ideal_customer"
            defaultValue={listing.ideal_customer || ''}
            className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#00FF94] focus:outline-none w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Product URL</label>
          <input
            type="url"
            name="product_url"
            defaultValue={listing.product_url || ''}
            className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#00FF94] focus:outline-none w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Commission per Appointment ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="commission_per_appointment"
              defaultValue={((listing.commission_per_appointment || 0) / 100).toFixed(2)}
              className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#00FF94] focus:outline-none w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Commission per Close ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="commission_per_close"
              defaultValue={((listing.commission_per_close || 0) / 100).toFixed(2)}
              className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#00FF94] focus:outline-none w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Qualified Meeting Definition *</label>
          <textarea
            name="qualified_meeting_definition"
            defaultValue={listing.qualified_meeting_definition || ''}
            className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#00FF94] focus:outline-none w-full h-24"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Pitch Kit URL</label>
          <input
            type="url"
            name="pitch_kit_url"
            defaultValue={listing.pitch_kit_url || ''}
            className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#00FF94] focus:outline-none w-full"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#00FF94] text-black font-semibold rounded-md px-4 py-2 hover:brightness-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-[#333] text-white bg-transparent rounded-md px-4 py-2 hover:bg-[#1a1a1a]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
