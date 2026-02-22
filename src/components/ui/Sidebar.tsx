'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type NavLink = {
  href: string
  label: string
}

type SidebarProps = {
  links: NavLink[]
  title?: string
}

export function Sidebar({ links, title = 'plugd' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-[#111] border-r border-[#222] min-h-screen flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[#00FF94] bg-[#00FF94]/5 border-l-2 border-[#00FF94]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#222]">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2.5 text-sm text-gray-500 hover:text-white transition-colors text-left"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
