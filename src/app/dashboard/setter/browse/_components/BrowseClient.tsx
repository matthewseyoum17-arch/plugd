'use client'

import { useState } from 'react'
import { applyToListing } from '../actions'

type Listing = {
  id: string
  title: string
  description: string | null
  ideal_customer: string | null
  commission_per_appointment: number
  commission_per_close: number
  company_name: string
}

export function BrowseClient({
  listings,
  appliedIds,
}: {
  listings: Listing[]
  appliedIds: string[]
}) {
  const [search, setSearch] = useState('')
  const [appliedSet, setAppliedSet] = useState<Set<string>>(new Set(appliedIds))
  const [modalListingId, setModalListingId] = useState<string | null>(null)
  const [sampleEmail, setSampleEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const filtered = listings.filter((l) => {
    const q = search.toLowerCase()
    return (
      l.title.toLowerCase().includes(q) ||
      l.company_name.toLowerCase().includes(q) ||
      (l.ideal_customer || '').toLowerCase().includes(q)
    )
  })

  const handleApply = async () => {
    if (!modalListingId) return
    setSubmitting(true)
    setError('')
    const result = await applyToListing(modalListingId, sampleEmail)
    if (result.error) {
      console.error('Apply error:', result.error)
      if (result.error === 'Already applied') {
        setAppliedSet((prev) => { const next = new Set(Array.from(prev)); next.add(modalListingId); return next })
        setModalListingId(null)
        setSampleEmail('')
      } else {
        setError(result.error)
      }
    } else {
      setAppliedSet((prev) => { const next = new Set(Array.from(prev)); next.add(modalListingId); return next })
      setModalListingId(null)
      setSampleEmail('')
    }
    setSubmitting(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Browse Listings</h1>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search listings..."
          className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#00FF94] focus:outline-none w-64"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((listing) => (
          <div
            key={listing.id}
            className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 hover:border-[#00FF94] transition-all duration-150 flex flex-col"
          >
            <p className="text-gray-400 text-sm mb-1">{listing.company_name}</p>
            <h3 className="text-lg font-semibold text-white mb-2">{listing.title}</h3>
            {listing.ideal_customer && (
              <p className="text-gray-400 text-sm line-clamp-2 mb-4">{listing.ideal_customer}</p>
            )}
            {!listing.ideal_customer && listing.description && (
              <p className="text-gray-400 text-sm line-clamp-2 mb-4">{listing.description}</p>
            )}

            <div className="flex gap-2 mb-4 mt-auto">
              <span className="px-3 py-1 rounded-full text-xs bg-green-900/50 text-[#00FF94]">
                ${((listing.commission_per_appointment || 0) / 100).toFixed(2)}/appt
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-[#222] text-gray-300">
                ${((listing.commission_per_close || 0) / 100).toFixed(2)}/close
              </span>
            </div>

            <div className="flex justify-end">
              {appliedSet.has(listing.id) ? (
                <span className="text-[#00FF94] text-sm font-medium">Applied ✓</span>
              ) : (
                <button
                  onClick={() => {
                    setModalListingId(listing.id)
                    setError('')
                    setSampleEmail('')
                  }}
                  className="bg-[#00FF94] text-black font-semibold rounded-md px-4 py-2 hover:brightness-90 text-sm"
                >
                  Promote
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No active listings found.
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {modalListingId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Apply to Promote</h3>
            <p className="text-gray-400 text-sm mb-4">
              Write a sample outreach email you&apos;d send to prospects for this product.
            </p>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded-md text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            <textarea
              value={sampleEmail}
              onChange={(e) => setSampleEmail(e.target.value)}
              placeholder="Hi [Name], I noticed your practice could benefit from..."
              className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#00FF94] focus:outline-none w-full h-40 mb-4"
              required
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModalListingId(null)}
                className="border border-[#333] text-white bg-transparent rounded-md px-4 py-2 text-sm hover:bg-[#222]"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={submitting || !sampleEmail.trim()}
                className="bg-[#00FF94] text-black font-semibold rounded-md px-4 py-2 hover:brightness-90 text-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
