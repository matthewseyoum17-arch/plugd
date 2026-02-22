'use client'

import { useState, useTransition } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Toast } from '@/components/ui/Toast'
import { submitAppointment } from '@/app/actions'

type Appointment = {
  id: string
  status: string
  contact_name: string
  contact_email: string
  contact_company: string
  appointment_type: string
  submitted_at: string
  listings: { title: string; commission_per_appointment: number; commission_per_close: number } | null
}

type ListingInfo = { id: string; title: string; company_id: string; commission_per_appointment: number; commission_per_close: number }

type ApprovedListing = {
  listing_id: string
  listings: ListingInfo | ListingInfo[] | null
}

const inputClass = 'w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg focus:outline-none focus:border-[#00FF94] text-white placeholder:text-gray-600'

function getListing(app: ApprovedListing): ListingInfo | null {
  if (!app.listings) return null
  return Array.isArray(app.listings) ? app.listings[0] ?? null : app.listings
}

function SubmitForm({ approvedListings }: { approvedListings: ApprovedListing[] }) {
  const [listingId, setListingId] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactCompany, setContactCompany] = useState('')
  const [calendlyUrl, setCalendlyUrl] = useState('')
  const [appointmentType, setAppointmentType] = useState<'appointment' | 'close'>('appointment')
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isPending, startTransition] = useTransition()

  if (approvedListings.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-12 text-center">
        <p className="text-gray-500">No approved products yet — browse listings and apply first.</p>
      </div>
    )
  }

  const selectedApp = approvedListings.find(a => a.listing_id === listingId)
  const selectedListing = selectedApp ? getListing(selectedApp) : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = await submitAppointment({
        listing_id: listingId,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_company: contactCompany,
        calendly_event_url: calendlyUrl,
        appointment_type: appointmentType,
      })
      if (result.error) {
        setError(result.error)
      } else {
        setToast({ message: 'Appointment submitted!', type: 'success' })
        setContactName('')
        setContactEmail('')
        setContactCompany('')
        setCalendlyUrl('')
        setAppointmentType('appointment')
      }
    })
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Product *</label>
          <select
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            required
            className={inputClass}
          >
            <option value="">Select a product...</option>
            {approvedListings.map(app => {
              const info = getListing(app)
              return (
              <option key={app.listing_id} value={app.listing_id}>
                {info?.title || 'Unknown'}
              </option>
              )
            })}
          </select>
        </div>

        {selectedListing && (
          <div className="flex gap-3 text-sm">
            <span className="px-2.5 py-1 bg-[#00FF94]/10 text-[#00FF94] rounded-full font-medium">
              ${((selectedListing.commission_per_appointment || 0) / 100).toFixed(2)}/appt
            </span>
            <span className="px-2.5 py-1 bg-[#222] text-gray-400 rounded-full">
              ${((selectedListing.commission_per_close || 0) / 100).toFixed(2)}/close
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contact Name *</label>
            <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass} required placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contact Email *</label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} required placeholder="john@company.com" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Contact Company *</label>
          <input type="text" value={contactCompany} onChange={(e) => setContactCompany(e.target.value)} className={inputClass} required placeholder="Acme Corp" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Calendly / Meeting URL</label>
          <input type="url" value={calendlyUrl} onChange={(e) => setCalendlyUrl(e.target.value)} className={inputClass} placeholder="https://calendly.com/..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="type" value="appointment" checked={appointmentType === 'appointment'} onChange={() => setAppointmentType('appointment')} className="w-4 h-4 accent-[#00FF94]" />
              <span className="text-white text-sm">Qualified Meeting</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="type" value="close" checked={appointmentType === 'close'} onChange={() => setAppointmentType('close')} className="w-4 h-4 accent-[#00FF94]" />
              <span className="text-white text-sm">Closed Deal</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || !listingId}
          className="px-6 py-3 bg-[#00FF94] text-black font-semibold rounded-lg hover:brightness-90 transition-all disabled:opacity-50"
        >
          {isPending ? 'Submitting...' : 'Submit Appointment'}
        </button>
      </form>
    </>
  )
}

function AppointmentList({ appointments }: { appointments: Appointment[] }) {
  if (appointments.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-12 text-center">
        <p className="text-gray-500">No appointments in this category.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {appointments.map(apt => (
        <div key={apt.id} className="bg-[#1a1a1a] border border-[#222] rounded-xl p-5 hover:border-[#00FF94]/20 transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <p className="text-white font-medium">{apt.listings?.title || 'N/A'}</p>
            <StatusBadge status={apt.status} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <p className="text-gray-500 text-xs">Contact</p>
              <p className="text-white">{apt.contact_name}</p>
              <p className="text-gray-500 text-xs">{apt.contact_email}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Type</p>
              <p className="text-white capitalize">{apt.appointment_type}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[#222] text-xs text-gray-500">
            <span>{new Date(apt.submitted_at).toLocaleDateString()}</span>
            <span className="text-[#00FF94]">
              ${((apt.appointment_type === 'appointment' ? apt.listings?.commission_per_appointment : apt.listings?.commission_per_close) || 0) / 100}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SetterAppointmentTabs({ appointments, approvedListings }: { appointments: Appointment[]; approvedListings: ApprovedListing[] }) {
  const pending = appointments.filter(a => a.status === 'submitted')
  const confirmed = appointments.filter(a => a.status === 'confirmed' || a.status === 'auto_approved')
  const earned = appointments.filter(a => a.status === 'confirmed' || a.status === 'auto_approved')

  return (
    <Tabs tabs={['Submit New', 'Pending', 'Confirmed', 'Earned']}>
      {(tab) => {
        if (tab === 'Submit New') return <SubmitForm approvedListings={approvedListings} />
        if (tab === 'Pending') return <AppointmentList appointments={pending} />
        if (tab === 'Confirmed') return <AppointmentList appointments={confirmed} />
        return <AppointmentList appointments={earned} />
      }}
    </Tabs>
  )
}
