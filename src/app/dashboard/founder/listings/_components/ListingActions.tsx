'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toggleListingStatus, deleteListing } from '@/app/actions'
import { useRouter } from 'next/navigation'

export function ListingActions({
  listingId,
  status,
}: {
  listingId: string
  status: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    setError('')
    const newStatus = status === 'active' ? 'paused' : 'active'
    const result = await toggleListingStatus(listingId, newStatus as 'active' | 'paused')
    if (result.error) {
      setError(result.error)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    setLoading(true)
    setError('')
    const result = await deleteListing(listingId)
    if (result.error) {
      setError(result.error)
    } else {
      router.refresh()
    }
    setLoading(false)
    setConfirmDelete(false)
  }

  return (
    <div>
      <div className="flex gap-2 flex-wrap">
        <Link
          href={`/dashboard/founder/listings/${listingId}/edit`}
          className="border border-[#333] text-white bg-transparent rounded-md px-4 py-2 text-xs hover:bg-[#1a1a1a] inline-block"
        >
          Edit
        </Link>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`border rounded-md px-4 py-2 text-xs disabled:opacity-50 ${
            status === 'active'
              ? 'border-yellow-800 text-yellow-400 hover:bg-yellow-900/20'
              : 'border-green-800 text-green-400 hover:bg-green-900/20'
          }`}
        >
          {status === 'active' ? 'Pause' : 'Activate'}
        </button>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="border border-red-800/50 text-red-400/70 rounded-md px-4 py-2 text-xs hover:bg-red-900/20 hover:text-red-400"
          >
            Delete
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white rounded-md px-3 py-2 text-xs hover:bg-red-700 disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="border border-[#333] text-gray-400 rounded-md px-3 py-2 text-xs hover:bg-[#1a1a1a]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  )
}
