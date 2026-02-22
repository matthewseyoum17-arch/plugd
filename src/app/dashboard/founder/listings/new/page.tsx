'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createListing } from '@/app/actions'

const STEPS = ['Product Info', 'Commission & Criteria', 'Review & Publish']

const inputClass = 'w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg focus:outline-none focus:border-[#00FF94] text-white placeholder:text-gray-600'
const labelClass = 'block text-sm font-medium text-gray-300 mb-2'

export default function CreateListing() {
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [idealCustomer, setIdealCustomer] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [commissionPerAppointment, setCommissionPerAppointment] = useState('')
  const [commissionPerClose, setCommissionPerClose] = useState('')
  const [qualifiedMeetingDefinition, setQualifiedMeetingDefinition] = useState('')
  const [pitchKitUrl, setPitchKitUrl] = useState('')

  const canNext = () => {
    if (step === 0) return title.trim() && description.trim()
    if (step === 1) return qualifiedMeetingDefinition.trim()
    return true
  }

  const handlePublish = () => {
    setError('')
    startTransition(async () => {
      const result = await createListing({
        title,
        description,
        ideal_customer: idealCustomer,
        product_url: productUrl,
        commission_per_appointment: Math.round(parseFloat(commissionPerAppointment || '0') * 100),
        commission_per_close: Math.round(parseFloat(commissionPerClose || '0') * 100),
        qualified_meeting_definition: qualifiedMeetingDefinition,
        pitch_kit_url: pitchKitUrl,
      })
      if (result.error) {
        setError(result.error)
      } else {
        router.push('/dashboard/founder/listings')
      }
    })
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">New Listing</h1>
      <p className="text-gray-500 mb-8">Create a new product listing for setters to promote.</p>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-10 max-w-2xl">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              i < step ? 'bg-[#00FF94] text-black' : i === step ? 'bg-[#00FF94]/20 text-[#00FF94] border border-[#00FF94]' : 'bg-[#1a1a1a] text-gray-500 border border-[#333]'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i <= step ? 'text-white' : 'text-gray-600'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-[#00FF94]' : 'bg-[#333]'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 mb-6 max-w-2xl">
          {error}
        </div>
      )}

      <div className="max-w-2xl">
        {/* Step 1: Product Info */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Product Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required placeholder="e.g., AI Receptionist for Dental Offices" />
            </div>
            <div>
              <label className={labelClass}>Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} h-32`} required placeholder="Describe your product and its key features..." />
            </div>
            <div>
              <label className={labelClass}>Ideal Customer</label>
              <input type="text" value={idealCustomer} onChange={(e) => setIdealCustomer(e.target.value)} className={inputClass} placeholder="e.g., Dental practices with 2-10 locations" />
            </div>
            <div>
              <label className={labelClass}>Product URL</label>
              <input type="url" value={productUrl} onChange={(e) => setProductUrl(e.target.value)} className={inputClass} placeholder="https://yourproduct.com" />
            </div>
          </div>
        )}

        {/* Step 2: Commission & Criteria */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Commission per Appointment ($)</label>
                <input type="number" step="0.01" min="0" value={commissionPerAppointment} onChange={(e) => setCommissionPerAppointment(e.target.value)} className={inputClass} placeholder="25.00" />
              </div>
              <div>
                <label className={labelClass}>Commission per Close ($)</label>
                <input type="number" step="0.01" min="0" value={commissionPerClose} onChange={(e) => setCommissionPerClose(e.target.value)} className={inputClass} placeholder="250.00" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Qualified Meeting Definition *</label>
              <textarea value={qualifiedMeetingDefinition} onChange={(e) => setQualifiedMeetingDefinition(e.target.value)} className={`${inputClass} h-24`} required placeholder="Define what counts as a qualified meeting..." />
            </div>
            <div>
              <label className={labelClass}>Pitch Kit URL</label>
              <input type="url" value={pitchKitUrl} onChange={(e) => setPitchKitUrl(e.target.value)} className={inputClass} placeholder="https://docs.google.com/..." />
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Title</p>
                <p className="text-white font-medium">{title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Description</p>
                <p className="text-gray-300 text-sm">{description}</p>
              </div>
              {idealCustomer && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Ideal Customer</p>
                  <p className="text-gray-300 text-sm">{idealCustomer}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">$/Appointment</p>
                  <p className="text-[#00FF94] font-semibold">${commissionPerAppointment || '0.00'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">$/Close</p>
                  <p className="text-[#00FF94] font-semibold">${commissionPerClose || '0.00'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Meeting Definition</p>
                <p className="text-gray-300 text-sm">{qualifiedMeetingDefinition}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 bg-transparent text-gray-300 border border-[#333] rounded-lg hover:bg-[#1a1a1a] transition-colors">
              Back
            </button>
          )}
          {step < 2 ? (
            <button type="button" onClick={() => setStep(step + 1)} disabled={!canNext()} className="px-6 py-3 bg-[#00FF94] text-black font-semibold rounded-lg hover:brightness-90 transition-all disabled:opacity-50">
              Continue
            </button>
          ) : (
            <button type="button" onClick={handlePublish} disabled={isPending} className="px-6 py-3 bg-[#00FF94] text-black font-semibold rounded-lg hover:brightness-90 transition-all disabled:opacity-50">
              {isPending ? 'Publishing...' : 'Publish Listing'}
            </button>
          )}
          <button type="button" onClick={() => router.back()} className="px-6 py-3 text-gray-500 hover:text-gray-300 transition-colors ml-auto">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
