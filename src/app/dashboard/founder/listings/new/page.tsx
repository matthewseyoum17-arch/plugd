'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CreateListing() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [idealCustomer, setIdealCustomer] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [commissionPerAppointment, setCommissionPerAppointment] = useState('')
  const [commissionPerClose, setCommissionPerClose] = useState('')
  const [qualifiedMeetingDefinition, setQualifiedMeetingDefinition] = useState('')
  const [pitchKitUrl, setPitchKitUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const role = user.user_metadata?.role
      if (role !== 'founder') {
        router.push('/dashboard/setter')
      }
    }
    checkUser()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    const { data: founderProfile } = await supabase
      .from('founder_profiles')
      .select('company_name')
      .eq('founder_id', user.id)
      .single()

    const { error: insertError } = await supabase.from('listings').insert({
      company_id: user.id,
      title,
      description,
      ideal_customer: idealCustomer,
      product_url: productUrl,
      commission_per_appointment: Math.round(parseFloat(commissionPerAppointment) * 100),
      commission_per_close: Math.round(parseFloat(commissionPerClose) * 100),
      qualified_meeting_definition: qualifiedMeetingDefinition,
      pitch_kit_url: pitchKitUrl,
      company_name: founderProfile?.company_name || 'My Company',
      status: 'active',
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/founder/listings')
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            value={idealCustomer}
            onChange={(e) => setIdealCustomer(e.target.value)}
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
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
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
              value={commissionPerAppointment}
              onChange={(e) => setCommissionPerAppointment(e.target.value)}
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
              value={commissionPerClose}
              onChange={(e) => setCommissionPerClose(e.target.value)}
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
            value={qualifiedMeetingDefinition}
            onChange={(e) => setQualifiedMeetingDefinition(e.target.value)}
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
            value={pitchKitUrl}
            onChange={(e) => setPitchKitUrl(e.target.value)}
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
