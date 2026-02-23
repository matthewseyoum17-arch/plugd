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

  if (remaining <= 0) return <span className="text-cyan-400 font-button font-medium text-xs tracking-wide uppercase">Auto-approved</span>

  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const s = Math.floor((remaining % 60000) / 1000)

  return (
    <span className="text-accent font-button font-semibold text-xs tracking-wider">
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
    <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-[0_10px_40px_rgba(123,57,252,0.1)] group">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-white font-heading font-semibold text-lg truncate group-hover:text-primary transition-colors">{props.listingTitle}</p>
          <p className="text-sm font-medium text-gray-400 mt-1">by <span className="text-gray-300">{props.setterName}</span></p>
        </div>
        <StatusBadge status={optimisticStatus} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 p-4 rounded-xl bg-black/40 border border-white/5">
        <div>
          <p className="text-gray-500 font-heading text-[10px] uppercase tracking-wider mb-1 font-semibold">Contact</p>
          <p className="text-white font-medium text-sm truncate">{props.contactName}</p>
          <p className="text-gray-400 text-xs truncate mt-0.5">{props.contactEmail}</p>
        </div>
        <div>
          <p className="text-gray-500 font-heading text-[10px] uppercase tracking-wider mb-1 font-semibold">Type</p>
          <p className="text-white font-medium text-sm capitalize">{props.appointmentType}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-glass-border">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-gray-500">{new Date(props.submittedAt).toLocaleDateString()}</span>
          {optimisticStatus === 'submitted' && <CountdownTimer submittedAt={props.submittedAt} />}
        </div>

        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="px-4 py-2 bg-primary text-white text-xs font-button font-semibold rounded-lg hover:bg-primary-hover transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(123,57,252,0.2)]"
            >
              Confirm
            </button>
            <button
              onClick={handleDispute}
              disabled={isPending}
              className="px-4 py-2 bg-transparent text-gray-400 border border-white/10 text-xs font-button font-medium rounded-lg hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50"
            >
              Dispute
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
