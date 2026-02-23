'use client'

import { useState, useTransition } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { submitAppointment } from '@/app/actions'
import { Toast } from '@/components/ui/Toast'
import { StatusBadge } from '@/components/ui/StatusBadge'

type Appointment = {
  id: string
  status: string
  contact_name: string
  contact_email: string
  appointment_type: string
  submitted_at: string
  listings: { title: string; commission_per_appointment: number; commission_per_close: number } | null
}

type ApprovedListing = {
  listing_id: string
  listings: {
    id: string
    title: string
    company_id: string
    commission_per_appointment: number
    commission_per_close: number
  } | null
}

function SubmitForm({ approvedListings }: { approvedListings: ApprovedListing[] }) {
  const [listingId, setListingId] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactCompany, setContactCompany] = useState('')
  const [calendlyUrl, setCalendlyUrl] = useState('')
  const [appointmentType, setAppointmentType] = useState('appointment')
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [error, setError] = useState('')

  const getListing = (app: ApprovedListing) => Array.isArray(app.listings) ? app.listings[0] : app.listings
  const selectedApp = approvedListings.find(app => app.listing_id === listingId)
  const selectedListing = selectedApp ? getListing(selectedApp) : null

  const inputClass = "w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-white placeholder:text-gray-500 backdrop-blur-md transition-all font-medium text-sm"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!selectedListing) {
      setError('Please select a product')
      return
    }

    startTransition(async () => {
      const result = await submitAppointment({
        listing_id: listingId,
        company_id: selectedListing.company_id,
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
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-8 shadow-sm">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">{error}</div>
        )}

        <div>
          <label className="block text-xs font-button font-semibold text-gray-400 uppercase tracking-wider mb-2">Product *</label>
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
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full font-button font-semibold text-xs tracking-wider">
              ${((selectedListing.commission_per_appointment || 0) / 100).toFixed(2)}/appt
            </span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-button font-semibold text-xs tracking-wider">
              ${((selectedListing.commission_per_close || 0) / 100).toFixed(2)}/close
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-button font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact Name *</label>
            <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass} required placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-button font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact Email *</label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} required placeholder="john@company.com" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-button font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact Company *</label>
          <input type="text" value={contactCompany} onChange={(e) => setContactCompany(e.target.value)} className={inputClass} required placeholder="Acme Corp" />
        </div>

        <div>
          <label className="block text-xs font-button font-semibold text-gray-400 uppercase tracking-wider mb-2">Calendly / Meeting URL</label>
          <input type="url" value={calendlyUrl} onChange={(e) => setCalendlyUrl(e.target.value)} className={inputClass} placeholder="https://calendly.com/..." />
        </div>

        <div>
          <label className="block text-xs font-button font-semibold text-gray-400 uppercase tracking-wider mb-3">Type *</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${appointmentType === 'appointment' ? 'border-primary bg-primary/20' : 'border-gray-600 group-hover:border-gray-400'}`}>
                {appointmentType === 'appointment' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <input type="radio" name="type" value="appointment" checked={appointmentType === 'appointment'} onChange={() => setAppointmentType('appointment')} className="hidden" />
              <span className="text-white text-sm font-medium">Qualified Meeting</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${appointmentType === 'close' ? 'border-primary bg-primary/20' : 'border-gray-600 group-hover:border-gray-400'}`}>
                {appointmentType === 'close' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <input type="radio" name="type" value="close" checked={appointmentType === 'close'} onChange={() => setAppointmentType('close')} className="hidden" />
              <span className="text-white text-sm font-medium">Closed Deal</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || !listingId}
          className="w-full py-4 bg-primary text-white text-base font-button font-semibold rounded-xl hover:bg-primary-hover transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(123,57,252,0.2)] hover:shadow-[0_0_30px_rgba(123,57,252,0.4)]"
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
      <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-16 text-center shadow-sm">
        <p className="text-gray-400 font-medium">No appointments in this category.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {appointments.map(apt => (
        <div key={apt.id} className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-[0_10px_40px_rgba(123,57,252,0.1)] group">
          <div className="flex items-start justify-between mb-5">
            <p className="text-white font-heading font-semibold text-lg truncate group-hover:text-primary transition-colors pr-4">{apt.listings?.title || 'N/A'}</p>
            <StatusBadge status={apt.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5 p-4 rounded-xl bg-black/40 border border-white/5">
            <div>
              <p className="text-gray-500 font-heading text-[10px] uppercase tracking-wider mb-1 font-semibold">Contact</p>
              <p className="text-white font-medium text-sm truncate">{apt.contact_name}</p>
              <p className="text-gray-400 text-xs truncate mt-0.5">{apt.contact_email}</p>
            </div>
            <div>
              <p className="text-gray-500 font-heading text-[10px] uppercase tracking-wider mb-1 font-semibold">Type</p>
              <p className="text-white font-medium text-sm capitalize">{apt.appointment_type}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-glass-border">
            <span className="text-xs font-medium text-gray-500">{new Date(apt.submitted_at).toLocaleDateString()}</span>
            <span className="text-primary font-semibold">
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
  const earned = appointments.filter(a => a.status === 'confirmed' || a.status === 'auto_approved') // In a real app, 'earned' status might be different

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
