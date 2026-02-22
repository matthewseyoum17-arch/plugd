'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createListing } from './actions'

export default function CreateListing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await createListing(formData)

    if (result?.error) {
      console.error('Error creating listing:', result.error)
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">New Listing</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Product Title *
          </label>
          <input
            type="text"
            name="title"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
            required
            placeholder="e.g., AI Receptionist for Dental Offices"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white h-32"
            required
            placeholder="Describe your AI product and its key features..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ideal Customer
          </label>
          <input
            type="text"
            name="ideal_customer"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
            placeholder="e.g., Dental practices with 2-10 locations"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Product URL
          </label>
          <input
            type="url"
            name="product_url"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
            placeholder="https://yourproduct.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Commission per Appointment ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="commission_per_appointment"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
              placeholder="25.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Commission per Close ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="commission_per_close"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
              placeholder="250.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Qualified Meeting Definition *
          </label>
          <textarea
            name="qualified_meeting_definition"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white h-24"
            required
            placeholder="Define what counts as a qualified meeting..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Pitch Kit URL
          </label>
          <input
            type="url"
            name="pitch_kit_url"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
            placeholder="https://docs.google.com/..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#00FF94] text-black font-medium rounded-lg hover:bg-[#00cc76] transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-[#1a1a1a] text-gray-300 border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
