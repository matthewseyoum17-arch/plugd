'use client'

import { useState } from 'react'
import { confirmAppointment, disputeAppointment } from '../actions'

type Appointment = {
  id: string
  setter_id: string
  setter_name: string
  contact_name: string
  contact_company: string
  listing_title: string
  appointment_type: string
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
  const diff = new Date(autoApproveAt).getTime() - Date.now()
  if (diff <= 0) return <span className="text-blue-300 text-xs">Auto-approved</span>
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return <span className="text-yellow-300 text-xs">{hours}h {mins}m left</span>
}

function AppointmentRow({ apt }: { apt: Appointment }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentStatus, setCurrentStatus] = useState(apt.status)

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    const result = await confirmAppointment(apt.id, apt.setter_id, apt.commission_amount)
    if (result.error) {
      console.error('Confirm error:', result.error)
      setError(result.error)
    } else {
      setCurrentStatus('confirmed')
    }
    setLoading(false)
  }

  const handleDispute = async () => {
    setLoading(true)
    setError('')
    const result = await disputeAppointment(apt.id)
    if (result.error) {
      console.error('Dispute error:', result.error)
      setError(result.error)
    } else {
      setCurrentStatus('disputed')
    }
    setLoading(false)
  }

  const isPending = currentStatus === 'submitted'

  return (
    <tr className="hover:bg-[#111] transition-all duration-150">
      <td className="px-5 py-4 text-white text-sm">{apt.setter_name}</td>
      <td className="px-5 py-4">
        <div className="text-white text-sm">{apt.contact_name}</div>
        <div className="text-gray-500 text-xs">{apt.contact_company}</div>
      </td>
      <td className="px-5 py-4 text-gray-400 text-sm">{apt.listing_title}</td>
      <td className="px-5 py-4">
        <span className={`px-2 py-0.5 rounded text-xs ${apt.appointment_type === 'appointment' ? 'bg-cyan-900/50 text-cyan-300' : 'bg-purple-900/50 text-purple-300'}`}>
          {apt.appointment_type}
        </span>
      </td>
      <td className="px-5 py-4 text-[#00FF94] text-sm font-medium">${(apt.commission_amount / 100).toFixed(2)}</td>
      <td className="px-5 py-4"><StatusBadge status={currentStatus} /></td>
      <td className="px-5 py-4 text-gray-500 text-xs">
        {new Date(apt.created_at).toLocaleDateString()}
        {isPending && apt.auto_approve_at && (
          <div className="mt-1"><Countdown autoApproveAt={apt.auto_approve_at} /></div>
        )}
      </td>
      <td className="px-5 py-4">
        {isPending && (
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="bg-[#00FF94] text-black font-semibold rounded-md px-3 py-1.5 hover:brightness-90 text-xs disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              onClick={handleDispute}
              disabled={loading}
              className="border border-[#333] text-white bg-transparent rounded-md px-3 py-1.5 text-xs disabled:opacity-50 hover:bg-[#1a1a1a]"
            >
              Dispute
            </button>
          </div>
        )}
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </td>
    </tr>
  )
}

export function AppointmentsClient({ appointments }: { appointments: Appointment[] }) {
  const [tab, setTab] = useState<'all' | 'pending' | 'confirmed'>('all')

  const filtered = appointments.filter((apt) => {
    if (tab === 'pending') return apt.status === 'submitted'
    if (tab === 'confirmed') return apt.status === 'confirmed' || apt.status === 'auto_approved'
    return true
  })

  const tabs = [
    { key: 'all' as const, label: 'All' },
    { key: 'pending' as const, label: 'Pending' },
    { key: 'confirmed' as const, label: 'Confirmed' },
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
                ? 'text-[#00FF94] border-[#00FF94]'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[#1a1a1a] border border-[#222] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#111]">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Setter</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contact</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Listing</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Commission</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {filtered.map((apt) => (
              <AppointmentRow key={apt.id} apt={apt} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-gray-500">
                  No appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
