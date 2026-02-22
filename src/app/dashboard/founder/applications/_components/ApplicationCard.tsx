'use client'

import { useState } from 'react'
import { approveApplication, rejectApplication } from '../actions'

type Application = {
  id: string
  status: string
  sample_email: string | null
  created_at: string
  setter_id: string
  setter_name: string
  setter_email: string
}

export function ApplicationCard({ app }: { app: Application }) {
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(app.status)

  const initial = (app.setter_name || 'U')[0].toUpperCase()

  const handleApprove = async () => {
    setLoading(true)
    setError('')
    const result = await approveApplication(app.id)
    if (result.error) {
      console.error('Error approving:', result.error)
      setError(result.error)
    } else {
      setStatus('approved')
    }
    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)
    setError('')
    const result = await rejectApplication(app.id)
    if (result.error) {
      console.error('Error rejecting:', result.error)
      setError(result.error)
    } else {
      setStatus('rejected')
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-[#111] transition-all duration-150">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[#00FF94]/20 text-[#00FF94] flex items-center justify-center text-sm font-semibold shrink-0">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-medium truncate">{app.setter_name}</p>
            <p className="text-gray-500 text-xs truncate">{app.setter_email}</p>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-gray-500 text-xs">{new Date(app.created_at).toLocaleDateString()}</p>
            {app.sample_email && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-[#00FF94] hover:underline"
              >
                {expanded ? 'Hide pitch' : 'View pitch'}
              </button>
            )}
          </div>
          {expanded && app.sample_email && (
            <div className="mt-2 p-3 bg-[#0A0A0A] border border-[#222] rounded-md text-xs text-gray-300 whitespace-pre-wrap">
              {app.sample_email}
            </div>
          )}
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
      </div>

      <div className="shrink-0 ml-4">
        {status === 'approved' && (
          <span className="px-3 py-1 rounded-full text-xs bg-green-900 text-green-300">Approved</span>
        )}
        {status === 'rejected' && (
          <span className="px-3 py-1 rounded-full text-xs bg-red-900 text-red-300">Rejected</span>
        )}
        {status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="bg-[#00FF94] text-black font-semibold rounded-md px-4 py-2 hover:brightness-90 text-xs disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="border border-[#333] text-white bg-transparent rounded-md px-4 py-2 text-xs disabled:opacity-50 hover:bg-[#1a1a1a]"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
