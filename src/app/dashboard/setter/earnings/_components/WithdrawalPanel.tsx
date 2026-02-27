'use client'

import { useState } from 'react'
import { requestWithdrawal } from '@/app/actions'

export function WithdrawalPanel({ availableBalance }: { availableBalance: number }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const minWithdrawal = 50 // $50

  const handleWithdraw = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    const dollars = parseFloat(amount || '0')
    const cents = Math.round(dollars * 100)

    if (dollars < minWithdrawal) {
      setError(`Minimum withdrawal is $${minWithdrawal.toFixed(2)}`)
      setLoading(false)
      return
    }

    if (cents > availableBalance) {
      setError('Insufficient cleared balance')
      setLoading(false)
      return
    }

    const result = await requestWithdrawal(cents)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(`Withdrawal of $${dollars.toFixed(2)} requested successfully`)
      setAmount('')
    }
    setLoading(false)
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-6 mb-8">
      <h2 className="text-lg font-semibold mb-2">Request Withdrawal</h2>
      <p className="text-gray-400 text-sm mb-4">
        Minimum withdrawal: ${minWithdrawal.toFixed(2)}. Payouts clear 14 days after confirmation.
      </p>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-800 rounded-md text-red-400 text-sm mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-900/20 border border-green-800 rounded-md text-green-400 text-sm mb-4">
          {success}
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-medium text-gray-400 mb-2">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            min={minWithdrawal}
            max={availableBalance / 100}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
            placeholder={`${minWithdrawal}.00`}
          />
        </div>
        <button
          onClick={handleWithdraw}
          disabled={loading || !amount || availableBalance < minWithdrawal * 100}
          className="px-5 py-3 bg-[#00FF94] text-black font-semibold rounded-lg hover:brightness-90 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Request Withdrawal'}
        </button>
      </div>

      {availableBalance > 0 && (
        <button
          onClick={() => setAmount(String(availableBalance / 100))}
          className="mt-2 text-xs text-[#00FF94] hover:underline"
        >
          Withdraw all (${(availableBalance / 100).toFixed(2)})
        </button>
      )}
    </div>
  )
}
