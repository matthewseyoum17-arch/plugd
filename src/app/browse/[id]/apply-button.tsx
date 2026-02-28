'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2 } from 'lucide-react'

export function ApplyButton({
  listingId,
  isLoggedIn,
  userRole,
  alreadyApplied,
}: {
  listingId: string
  isLoggedIn: boolean
  userRole?: string
  alreadyApplied: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(alreadyApplied)
  const [showForm, setShowForm] = useState(false)
  const [sampleEmail, setSampleEmail] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  if (!isLoggedIn) {
    return (
      <a
        href={`/signup?role=setter`}
        className="w-full py-3 px-4 bg-[#ffffff] text-black font-semibold rounded-xl hover:bg-[#00cc76] transition-all text-sm text-center block"
      >
        Sign Up to Apply
      </a>
    )
  }

  if (userRole === 'founder') {
    return (
      <div className="w-full py-3 px-4 bg-white/[0.03] border border-white/[0.08] text-gray-500 font-medium rounded-xl text-sm text-center">
        This is a founder listing
      </div>
    )
  }

  if (applied) {
    return (
      <div className="w-full py-3 px-4 bg-[#ffffff]/[0.06] border border-[#ffffff]/20 text-[#ffffff] font-medium rounded-xl text-sm text-center flex items-center justify-center gap-2">
        <CheckCircle2 className="w-4 h-4" />
        Application Submitted
      </div>
    )
  }

  const handleApply = async () => {
    if (!sampleEmail.trim()) {
      setError('Please write a sample outreach email.')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: insertError } = await supabase
      .from('setter_applications')
      .insert({
        setter_id: user.id,
        listing_id: listingId,
        sample_email: sampleEmail,
        status: 'pending',
      })

    if (insertError) {
      setError(insertError.message.includes('duplicate')
        ? 'You already applied to this listing.'
        : insertError.message)
      setLoading(false)
      return
    }

    setApplied(true)
    setShowForm(false)
    setLoading(false)
  }

  if (showForm) {
    return (
      <div className="space-y-3">
        <textarea
          value={sampleEmail}
          onChange={(e) => setSampleEmail(e.target.value)}
          placeholder="Write a sample outreach email to show the founder your skills..."
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[#ffffff]/50 focus:ring-1 focus:ring-[#ffffff]/50 text-white text-sm h-32 resize-none placeholder-gray-600"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-[#ffffff] text-black font-semibold rounded-xl hover:bg-[#00cc76] transition-all text-sm disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="py-3 px-4 bg-white/[0.03] border border-white/[0.08] text-gray-400 rounded-xl hover:bg-white/[0.06] transition-all text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="w-full py-3 px-4 bg-[#ffffff] text-black font-semibold rounded-xl hover:bg-[#00cc76] transition-all text-sm"
    >
      Apply to Promote
    </button>
  )
}
