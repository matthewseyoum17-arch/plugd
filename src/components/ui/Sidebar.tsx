'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Command, LogOut } from 'lucide-react'

type NavLink = {
  href: string
  label: string
}

type SidebarProps = {
  links: NavLink[]
  title?: string
}

export function Sidebar({ links, title = 'Datacore' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-glass-bg border-r border-glass-border backdrop-blur-xl min-h-screen flex flex-col shadow-2xl z-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      <div className="p-6 relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-lg">
            <Command className="w-4 h-4 text-black" />
          </div>
          <span className="font-heading font-semibold tracking-tight text-xl text-white">{title}</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 relative z-10 mt-4">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 rounded-xl text-sm font-button font-medium transition-all ${
                isActive
                  ? 'text-white bg-primary shadow-[0_0_20px_rgba(123,57,252,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-glass-border relative z-10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-button font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
