'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Supabase will automatically pick up the token from the URL hash
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    // Also set ready if user is already authenticated (token was already processed)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setReady(true)
    })
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-white/[0.03] border border-white/10 rounded-2xl mb-6">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">New Password</h1>
          <p className="text-gray-400 text-sm">Choose a new password for your account.</p>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Password Updated</h2>
              <p className="text-gray-400 text-sm">Redirecting you to sign in...</p>
            </div>
          ) : !ready ? (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm mb-4">Verifying your reset link...</p>
              <div className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
              <p className="text-gray-500 text-xs mt-4">
                If this takes too long, your link may have expired.{' '}
                <Link href="/forgot-password" className="text-white hover:text-zinc-300">Request a new one</Link>
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="peer w-full px-4 pt-6 pb-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-white transition-all placeholder-transparent pr-12 text-sm"
                    required
                    placeholder="New password"
                    minLength={6}
                  />
                  <label
                    htmlFor="new-password"
                    className="absolute left-4 top-2 text-[10px] font-medium text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-zinc-400"
                  >
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="peer w-full px-4 pt-6 pb-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-white transition-all placeholder-transparent text-sm"
                    required
                    placeholder="Confirm password"
                    minLength={6}
                  />
                  <label
                    htmlFor="confirm-password"
                    className="absolute left-4 top-2 text-[10px] font-medium text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-zinc-400"
                  >
                    Confirm Password
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
