'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState<'founder' | 'setter'>('setter')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
          ...(role === 'founder' ? { company_name: companyName } : {}),
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      router.push(`/dashboard/${role}`)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Plugd</h1>
          <p className="text-gray-400">Create your account</p>
        </div>
        
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                I am a...
              </label>
              <div className="flex gap-4">
                <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${role === 'founder' ? 'border-[#00FF94] bg-[#00FF94]/10' : 'border-[#2a2a2a] hover:border-[#3a3a3a]'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="founder"
                    checked={role === 'founder'}
                    onChange={() => setRole('founder')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">Founder</div>
                    <div className="text-xs text-gray-400 mt-1">List your product</div>
                  </div>
                </label>
                <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${role === 'setter' ? 'border-[#00FF94] bg-[#00FF94]/10' : 'border-[#2a2a2a] hover:border-[#3a3a3a]'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="setter"
                    checked={role === 'setter'}
                    onChange={() => setRole('setter')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">Setter</div>
                    <div className="text-xs text-gray-400 mt-1">Promote products</div>
                  </div>
                </label>
              </div>
            </div>

            {role === 'founder' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
                  required
                  placeholder="Your company name"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#00FF94] text-black font-semibold rounded-lg hover:bg-[#00cc76] transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-[#00FF94] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
