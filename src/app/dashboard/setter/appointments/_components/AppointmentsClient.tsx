'use client'

import { useState, useEffect } from 'react'
import { submitAppointment } from '../actions'
import ReviewModal from '@/components/review-modal'
import { Star } from 'lucide-react'

type ApprovedListing = {
  listing_id: string
  title: string
  commission_per_appointment: number
  commission_per_close: number
  max_appointments: number
  appointments_used: number
  daily_setter_cap: number
  listing_status: string
}

type Appointment = {
  id: string
  company_id: string
  company_name: string
  listing_title: string
  contact_name: string
  commission_amount: number
  status: string
  auto_approve_at: string | null
  created_at: string
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    submitted: 'bg-yellow-900 text-yellow-300',
    confirmed: 'bg-green-900 text-green-300',
    disputed: 'bg-red-900 text-red-300',
    auto_approved: 'bg-blue-900 text-blue-300',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-800 text-gray-400'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function Countdown({ autoApproveAt }: { autoApproveAt: string }) {
  const getRemaining = () => Math.max(0, new Date(autoApproveAt).getTime() - Date.now())
  const [remaining, setRemaining] = useState(getRemaining())

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining()), 1000)
    return () => clearInterval(interval)
  }, [autoApproveAt])

  if (remaining <= 0) return <span className="text-blue-300 text-xs">Auto-approved</span>
  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const s = Math.floor((remaining % 60000) / 1000)
  return <span className="text-yellow-300 text-xs font-mono">{h}h {m}m {s}s</span>
}

function SetterAppointmentCard({ apt }: { apt: Appointment }) {
  const [showReview, setShowReview] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const isConfirmed = apt.status === 'confirmed' || apt.status === 'auto_approved'

  return (
    <>
      <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 flex items-center justify-between hover:border-[#ffffff] transition-all duration-150">
        <div>
          <p className="text-white font-medium">{apt.listing_title}</p>
          <p className="text-gray-400 text-sm">Contact: {apt.contact_name}</p>
          <p className="text-gray-500 text-xs">Founder: {apt.company_name}</p>
          <p className="text-[#ffffff] text-sm font-medium">${(apt.commission_amount / 100).toFixed(2)}</p>
          {apt.status === 'submitted' && apt.auto_approve_at && (
            <div className="mt-1"><Countdown autoApproveAt={apt.auto_approve_at} /></div>
          )}
        </div>
        <div className="text-right space-y-2">
          <StatusBadge status={apt.status} />
          <p className="text-gray-500 text-xs">{new Date(apt.created_at).toLocaleDateString()}</p>
          {isConfirmed && !reviewed && (
            <button
              onClick={() => setShowReview(true)}
              className="flex items-center gap-1 border border-yellow-800/50 text-yellow-400 rounded-md px-3 py-1.5 text-xs hover:bg-yellow-900/20 transition-colors ml-auto"
            >
              <Star className="w-3 h-3" /> Review Founder
            </button>
          )}
          {reviewed && (
            <span className="text-green-400 text-xs flex items-center gap-1 justify-end"><Star className="w-3 h-3 fill-green-400" /> Reviewed</span>
          )}
        </div>
      </div>
      {showReview && (
        <ReviewModal
          appointmentId={apt.id}
          revieweeId={apt.company_id}
          revieweeName={apt.company_name}
          onClose={() => setShowReview(false)}
          onSubmitted={() => { setShowReview(false); setReviewed(true) }}
        />
      )}
    </>
  )
}

export function AppointmentsClient({
  approvedListings,
  appointments,
}: {
  approvedListings: ApprovedListing[]
  appointments: Appointment[]
}) {
  const [tab, setTab] = useState<'submit' | 'list'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedListing, setSelectedListing] = useState('')
  const [appointmentType, setAppointmentType] = useState('appointment')

  const selected = approvedListings.find((l) => l.listing_id === selectedListing)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const result = await submitAppointment({
      listing_id: formData.get('listing_id') as string,
      contact_name: formData.get('contact_name') as string,
      contact_email: formData.get('contact_email') as string,
      contact_company: formData.get('contact_company') as string,
      calendly_event_url: (formData.get('calendly_event_url') as string) || '',
      appointment_type: appointmentType as 'appointment' | 'close',
    })
    if (result.error) {
      console.error('Submit appointment error:', result.error)
      setError(result.error)
    } else {
      setSuccess(true)
      ;(e.target as HTMLFormElement).reset()
      setSelectedListing('')
    }
    setSubmitting(false)
  }

  const tabs = [
    { key: 'list' as const, label: 'My Appointments' },
    { key: 'submit' as const, label: 'Submit New' },
  ]

  return (
    <div>
      <div className="flex gap-1 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'text-[#ffffff] border-[#ffffff]'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'submit' && (
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 max-w-2xl">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-800 rounded-md text-red-400 text-sm mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-900/20 border border-green-800 rounded-md text-green-400 text-sm mb-4">
              Appointment submitted successfully!
            </div>
          )}

          {approvedListings.length === 0 ? (
            <p className="text-gray-400">No approved listings yet. Apply to listings first.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Listing *</label>
                <select
                  name="listing_id"
                  value={selectedListing}
                  onChange={(e) => setSelectedListing(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#ffffff] focus:outline-none w-full"
                  required
                >
                  <option value="">Select a listing</option>
                  {approvedListings.map((l) => {
                    const isFull = l.max_appointments > 0 && l.appointments_used >= l.max_appointments
                    return (
                      <option key={l.listing_id} value={l.listing_id} disabled={isFull || l.listing_status !== 'active'}>
                        {l.title}{isFull ? ' (Budget Full)' : l.listing_status !== 'active' ? ' (Paused)' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Budget info for selected listing */}
              {selected && selected.max_appointments > 0 && (
                <div className="p-3 bg-[#111] border border-[#333] rounded-md">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Budget:</span>
                    <span className={`font-medium ${selected.appointments_used >= selected.max_appointments ? 'text-red-400' : 'text-white'}`}>
                      {selected.appointments_used}/{selected.max_appointments} appointments used
                    </span>
                  </div>
                  <div className="w-full bg-[#333] rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full ${selected.appointments_used >= selected.max_appointments ? 'bg-red-500' : 'bg-[#ffffff]'}`}
                      style={{ width: `${Math.min(100, (selected.appointments_used / selected.max_appointments) * 100)}%` }}
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Daily cap: {selected.daily_setter_cap} submissions/day</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Contact Name *</label>
                  <input
                    type="text"
                    name="contact_name"
                    className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#ffffff] focus:outline-none w-full"
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Contact Email *</label>
                  <input
                    type="email"
                    name="contact_email"
                    className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#ffffff] focus:outline-none w-full"
                    required
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Contact Company *</label>
                <input
                  type="text"
                  name="contact_company"
                  className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#ffffff] focus:outline-none w-full"
                  required
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Calendly Event URL *</label>
                <input
                  type="url"
                  name="calendly_event_url"
                  className="bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 focus:border-[#ffffff] focus:outline-none w-full"
                  placeholder="https://calendly.com/..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Appointment Type *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="appointment_type_radio"
                      value="appointment"
                      checked={appointmentType === 'appointment'}
                      onChange={() => setAppointmentType('appointment')}
                      className="w-4 h-4 accent-[#ffffff]"
                    />
                    <span className="text-white text-sm">
                      Appointment{selected ? ` ($${(((selected.commission_per_appointment || 0) * 0.93) / 100).toFixed(2)} after 7% fee)` : ''}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="appointment_type_radio"
                      value="close"
                      checked={appointmentType === 'close'}
                      onChange={() => setAppointmentType('close')}
                      className="w-4 h-4 accent-[#ffffff]"
                    />
                    <span className="text-white text-sm">
                      Close{selected ? ` ($${(((selected.commission_per_close || 0) * 0.95) / 100).toFixed(2)} after 5% fee)` : ''}
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#ffffff] text-black font-semibold rounded-md px-4 py-2 hover:brightness-90 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Appointment'}
              </button>
            </form>
          )}
        </div>
      )}

      {tab === 'list' && (
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 text-center">
              <p className="text-gray-400">No appointments yet. Submit your first appointment.</p>
            </div>
          ) : (
            appointments.map((apt) => (
              <SetterAppointmentCard key={apt.id} apt={apt} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
