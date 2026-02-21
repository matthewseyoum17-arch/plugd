'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type AppointmentActionProps = {
  appointmentId: string
  currentStatus: string
  setterId: string
  commissionPerAppointment: number
  commissionPerClose: number
  appointmentType: string
}

export function AppointmentActions({ 
  appointmentId, 
  currentStatus,
  setterId,
  commissionPerAppointment,
  commissionPerClose,
  appointmentType
}: AppointmentActionProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  if (currentStatus !== 'submitted' && currentStatus !== 'disputed') {
    return null
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // 1. Update appointment status
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointmentId)

      if (updateError) throw updateError

      // 2. Create payout record
      const commissionAmount = appointmentType === 'appointment' 
        ? commissionPerAppointment 
        : commissionPerClose

      const { error: payoutError } = await supabase
        .from('payouts')
        .insert({
          founder_id: user.id,
          setter_id: setterId,
          appointment_id: appointmentId,
          amount: commissionAmount,
          status: 'pending'
        })

      if (payoutError) throw payoutError

      router.refresh()
    } catch (error) {
      console.error('Error confirming appointment:', error)
      alert('Failed to confirm appointment')
    } finally {
      setLoading(false)
    }
  }

  const handleDispute = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'disputed' })
        .eq('id', appointmentId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error disputing appointment:', error)
      alert('Failed to dispute appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded-lg hover:bg-green-900/50 transition-colors text-xs font-medium disabled:opacity-50"
      >
        Confirm
      </button>
      {currentStatus === 'submitted' && (
        <button
          onClick={handleDispute}
          disabled={loading}
          className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-800 rounded-lg hover:bg-red-900/50 transition-colors text-xs font-medium disabled:opacity-50"
        >
          Dispute
        </button>
      )}
    </div>
  )
}
