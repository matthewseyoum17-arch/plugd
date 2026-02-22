'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateListing } from './actions'

type Listing = {
  id: string
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

export function EditForm({ listing }: { listing: Listing }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await updateListing(listing.id, formData)

    if (result?.error) {
      console.error('Error updating listing:', result.error)
      setError(result.error)
      setLoading(false)
    }
  }

  return (
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

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
        <select
          name="status"
          defaultValue={listing.status}
          className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#00FF94] focus:outline-none w-full"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#00FF94] text-black font-semibold rounded-md px-4 py-2 hover:brightness-90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
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
  )
}
