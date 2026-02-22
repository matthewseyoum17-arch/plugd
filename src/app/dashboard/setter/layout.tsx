'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

const navItems = [
  { name: 'Overview', href: '/dashboard/setter' },
  { name: 'Browse', href: '/dashboard/setter/browse' },
  { name: 'Applications', href: '/dashboard/setter/applications' },
  { name: 'Appointments', href: '/dashboard/setter/appointments' },
  { name: 'Earnings', href: '/dashboard/setter/earnings' },
]

export default function SetterDashboardLayout({
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
        if (role !== 'setter') {
          router.push('/dashboard/founder')
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  const fullName = user.user_metadata?.first_name && user.user_metadata?.last_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    : user.email?.split('@')[0] || 'Setter'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="flex">
        <aside className="w-64 bg-[#111] min-h-screen p-6 fixed">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#00FF94]" style={{ fontFamily: 'Syne, sans-serif' }}>Plugd</h1>
            <p className="text-sm text-gray-400">Setter Dashboard</p>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-[#00FF94] text-black font-medium'
                    : 'text-gray-300 hover:bg-[#1a1a1a]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-[#2a2a2a]">
            <div className="text-sm text-gray-400 mb-2">Signed in as</div>
            <div className="text-white font-medium truncate">{fullName}</div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-gray-400 hover:text-white transition-colors text-left text-sm"
            >
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8 ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
