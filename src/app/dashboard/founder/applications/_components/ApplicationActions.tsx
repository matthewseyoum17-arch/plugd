'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type ApplicationActionProps = {
  applicationId: string
  setterName: string
  listingTitle: string
  currentStatus: string
}

export function ApplicationActions({ 
  applicationId, 
  setterName, 
  listingTitle,
  currentStatus 
}: ApplicationActionProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  if (currentStatus !== 'pending') {
    return null
  }

  const handleApprove = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('setter_applications')
        .update({ status: 'approved' })
        .eq('id', applicationId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error approving application:', error)
      alert('Failed to approve application')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('setter_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error rejecting application:', error)
      alert('Failed to reject application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded-lg hover:bg-green-900/50 transition-colors text-xs font-medium disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-800 rounded-lg hover:bg-red-900/50 transition-colors text-xs font-medium disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  )
}
