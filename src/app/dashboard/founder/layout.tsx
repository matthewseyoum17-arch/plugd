'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

const navItems = [
  { name: 'Overview', href: '/dashboard/founder' },
  { name: 'My Listings', href: '/dashboard/founder/listings' },
  { name: 'Appointments', href: '/dashboard/founder/appointments' },
  { name: 'Earnings', href: '/dashboard/founder/earnings' },
]

export default function FounderDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/login')
      } else {
        const role = session.user.user_metadata?.role
        if (role !== 'founder') {
          router.push('/dashboard/setter')
        }
        setUser(session.user)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        <aside className="w-64 bg-gray-800 min-h-screen p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-blue-400">Plugd</h1>
            <p className="text-sm text-gray-400">Founder Dashboard</p>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-gray-300 hover:text-white transition-colors text-left"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
