'use client'

import { useTransition, useState, useEffect, useCallback } from 'react'
import { confirmAppointment, disputeAppointment } from '@/app/actions'
import { StatusBadge } from '@/components/ui/StatusBadge'

type Props = {
  id: string
  status: string
  setterName: string
  listingTitle: string
  contactName: string
  contactEmail: string
  appointmentType: string
  submittedAt: string
  setterId: string
  commissionPerAppointment: number
  commissionPerClose: number
}

function CountdownTimer({ submittedAt }: { submittedAt: string }) {
  const getRemaining = useCallback(() => {
    const autoApprove = new Date(submittedAt).getTime() + 72 * 60 * 60 * 1000
    return Math.max(0, autoApprove - Date.now())
  }, [submittedAt])

  const [remaining, setRemaining] = useState(getRemaining())

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining()), 1000)
    return () => clearInterval(interval)
  }, [getRemaining])

  if (remaining <= 0) return <span className="text-blue-400 text-xs">Auto-approved</span>

  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const s = Math.floor((remaining % 60000) / 1000)

  return (
    <span className="text-yellow-400 text-xs font-mono">
      {h}h {m}m {s}s
    </span>
  )
}

export function AppointmentCard(props: Props) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useState(props.status)

  const handleConfirm = () => {
    setOptimisticStatus('confirmed')
    const commission = props.appointmentType === 'appointment'
      ? props.commissionPerAppointment
      : props.commissionPerClose
    startTransition(async () => {
      const result = await confirmAppointment(props.id, props.setterId, commission)
      if (result.error) setOptimisticStatus(props.status)
    })
  }

  const handleDispute = () => {
    setOptimisticStatus('disputed')
    startTransition(async () => {
      const result = await disputeAppointment(props.id)
      if (result.error) setOptimisticStatus(props.status)
    })
  }

  const showActions = optimisticStatus === 'submitted'

  return (
    <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-5 hover:border-[#00FF94]/20 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-medium">{props.listingTitle}</p>
          <p className="text-sm text-gray-500">by {props.setterName}</p>
        </div>
        <StatusBadge status={optimisticStatus} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <p className="text-gray-500 text-xs">Contact</p>
          <p className="text-white">{props.contactName}</p>
          <p className="text-gray-500 text-xs">{props.contactEmail}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Type</p>
          <p className="text-white capitalize">{props.appointmentType}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#222]">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{new Date(props.submittedAt).toLocaleDateString()}</span>
          {optimisticStatus === 'submitted' && <CountdownTimer submittedAt={props.submittedAt} />}
        </div>

        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="px-3 py-1.5 bg-[#00FF94] text-black text-xs font-semibold rounded-lg hover:brightness-90 transition-all disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              onClick={handleDispute}
              disabled={isPending}
              className="px-3 py-1.5 bg-transparent text-red-400 border border-red-800 text-xs font-medium rounded-lg hover:bg-red-900/30 transition-all disabled:opacity-50"
            >
              Dispute
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
