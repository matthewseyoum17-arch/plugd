'use client'

import { useState } from 'react'
import { depositToWallet, withdrawFromWallet } from '@/app/actions'

export function WalletPanel({ balance }: { balance: number }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleDeposit = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    const cents = Math.round(parseFloat(amount || '0') * 100)
    if (cents < 100) {
      setError('Minimum deposit is $1.00')
      setLoading(false)
      return
    }
    const result = await depositToWallet(cents)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(`Deposited $${(cents / 100).toFixed(2)} successfully`)
      setAmount('')
    }
    setLoading(false)
  }

  const handleWithdraw = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    const cents = Math.round(parseFloat(amount || '0') * 100)
    if (cents < 100) {
      setError('Minimum withdrawal is $1.00')
      setLoading(false)
      return
    }
    if (cents > balance) {
      setError('Insufficient balance')
      setLoading(false)
      return
    }
    const result = await withdrawFromWallet(cents)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(`Withdrew $${(cents / 100).toFixed(2)} successfully`)
      setAmount('')
    }
    setLoading(false)
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-8">
      <h2 className="text-lg font-semibold mb-4">Fund Your Wallet</h2>
      <p className="text-gray-400 text-sm mb-4">
        Pre-fund your wallet to pay setters when appointments are confirmed. Your balance is deducted automatically.
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
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:outline-none focus:border-[#ffffff] text-white"
            placeholder="100.00"
          />
        </div>
        <button
          onClick={handleDeposit}
          disabled={loading || !amount}
          className="px-5 py-3 bg-[#ffffff] text-black font-semibold rounded-lg hover:brightness-90 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Deposit'}
        </button>
        <button
          onClick={handleWithdraw}
          disabled={loading || !amount || balance <= 0}
          className="px-5 py-3 bg-transparent text-white border border-[#333] font-semibold rounded-lg hover:bg-[#222] disabled:opacity-50"
        >
          Withdraw
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        {[50, 100, 250, 500].map((preset) => (
          <button
            key={preset}
            onClick={() => setAmount(String(preset))}
            className="px-3 py-1 text-xs bg-[#222] border border-[#333] text-gray-300 rounded-md hover:border-[#ffffff] hover:text-white transition-colors"
          >
            ${preset}
          </button>
        ))}
      </div>
    </div>
  )
}
