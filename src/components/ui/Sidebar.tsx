"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Bot, LogOut } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
};

type SidebarProps = {
  links: NavLink[];
  title?: string;
};

export function Sidebar({ links, title = "Plugd" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 w-64 bg-glass-bg border-r border-glass-border backdrop-blur-xl min-h-screen flex flex-col shadow-2xl z-20">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      <div className="p-6 relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-neon/[0.12] border border-neon/25 flex items-center justify-center shadow-neon group-hover:shadow-neon-lg transition-shadow">
            <Bot className="w-4 h-4 text-neon" />
          </div>
          <span className="font-heading font-semibold tracking-tight text-xl text-white group-hover:text-neon transition-colors">
            {title}
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 relative z-10 mt-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 rounded-xl text-sm font-button font-medium transition-all ${
                isActive
                  ? "text-background bg-neon shadow-neon"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          );
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
  );
}
