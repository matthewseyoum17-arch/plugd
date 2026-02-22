'use client'

import { useTransition } from 'react'
import { toggleListingStatus } from '@/app/actions'

export function StatusToggle({ listingId, currentStatus }: { listingId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition()

  const toggle = () => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    startTransition(async () => {
      await toggleListingStatus(listingId, newStatus)
    })
  }

  const isActive = currentStatus === 'active'

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
        isActive ? 'bg-[#00FF94]' : 'bg-[#333]'
      }`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
        isActive ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  )
}
