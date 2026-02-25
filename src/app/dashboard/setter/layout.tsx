'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { LayoutDashboard, Compass, Send, Package, CalendarCheck, DollarSign, LogOut, Zap, UserCircle, MessageSquare, Menu, X } from 'lucide-react'

const navItems = [
  { name: 'Overview', href: '/dashboard/setter', icon: LayoutDashboard },
  { name: 'Browse', href: '/dashboard/setter/browse', icon: Compass },
  { name: 'Applications', href: '/dashboard/setter/applications', icon: Send },
  { name: 'My Products', href: '/dashboard/setter/products', icon: Package },
  { name: 'Appointments', href: '/dashboard/setter/appointments', icon: CalendarCheck },
  { name: 'Messages', href: '/dashboard/setter/messages', icon: MessageSquare },
  { name: 'Earnings', href: '/dashboard/setter/earnings', icon: DollarSign },
  { name: 'My Profile', href: '/dashboard/setter/profile', icon: UserCircle },
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#00FF94]/30 border-t-[#00FF94] rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const fullName = user.user_metadata?.full_name
    || (user.user_metadata?.first_name && user.user_metadata?.last_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      : user.email?.split('@')[0] || 'Setter')

  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const isActive = (href: string) => {
    if (href === '/dashboard/setter') return pathname === href
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <>
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FF94] to-[#0088ff] flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Plugd</span>
        </Link>
        <div className="mt-1 ml-[42px]">
          <span className="text-[10px] font-medium text-[#0088ff]/60 uppercase tracking-widest">Setter</span>
        </div>
      </div>

      <nav className="px-3 mt-2 space-y-0.5 flex-1">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-[#00FF94]/10 text-[#00FF94] border border-[#00FF94]/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#00FF94]' : ''}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#141414]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00FF94]/20 to-[#0088ff]/20 border border-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{fullName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-gray-500 hover:text-red-400 transition-colors text-xs rounded-lg hover:bg-red-500/5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      <div className="lg:hidden sticky top-0 z-30 bg-[#0a0a0a] border-b border-[#141414] px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00FF94] to-[#0088ff] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="text-base font-bold text-white">Plugd</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center text-gray-400"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex">
        <aside className="hidden lg:flex w-64 bg-[#0a0a0a] min-h-screen fixed border-r border-[#141414] flex-col">
          {sidebarContent}
        </aside>

        <aside className={`lg:hidden fixed top-14 left-0 bottom-0 w-72 bg-[#0a0a0a] border-r border-[#141414] flex flex-col z-50 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {sidebarContent}
        </aside>

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
