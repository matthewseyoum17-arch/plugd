'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/ui/Sidebar'

const founderLinks = [
  { href: '/dashboard/founder', label: 'Overview' },
  { href: '/dashboard/founder/listings', label: 'My Products' },
  { href: '/dashboard/founder/applications', label: 'Setter Applications' },
  { href: '/dashboard/founder/appointments', label: 'Appointments' },
  { href: '/dashboard/founder/earnings', label: 'Earnings & Payouts' },
]

export default function FounderLayout({
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  const fullName = user.user_metadata?.first_name && user.user_metadata?.last_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    : user.email?.split('@')[0] || 'Founder'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="flex">
        <aside className="w-64 bg-[#111] min-h-screen p-6 fixed">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#00FF94]" style={{ fontFamily: 'Syne, sans-serif' }}>Plugd</h1>
            <p className="text-sm text-gray-400">Founder Dashboard</p>
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
          {children}
        </div>
      </main>
    </div>
  )
}
