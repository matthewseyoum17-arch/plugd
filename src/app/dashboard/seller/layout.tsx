"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  DollarSign,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/dashboard/seller", icon: LayoutDashboard },
  { name: "My Gigs", href: "/dashboard/seller/gigs", icon: Package },
  { name: "Orders", href: "/dashboard/seller/orders", icon: ShoppingCart },
  { name: "Messages", href: "/dashboard/seller/messages", icon: MessageSquare },
  { name: "Earnings", href: "/dashboard/seller/earnings", icon: DollarSign },
  { name: "Profile", href: "/dashboard/seller/profile", icon: UserCircle },
];

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--cta)]/30 border-t-[var(--cta)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.username ||
    user.email?.split("@")[0] ||
    "Seller";

  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (href: string) => {
    if (href === "/dashboard/seller") return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-lg font-bold text-[var(--foreground)] tracking-tight">
            GigFlow
          </span>
        </Link>
        <div className="mt-1">
          <span className="text-[10px] font-medium text-[var(--cta)] uppercase tracking-widest">
            Seller Dashboard
          </span>
        </div>
      </div>

      <nav className="px-3 mt-2 space-y-0.5 flex-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-[var(--cta)]/10 text-[var(--cta)] border border-[var(--cta)]/20"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] border border-transparent"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${active ? "text-[var(--cta)]" : ""}`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[var(--cta)] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--foreground)] truncate">
              {fullName}
            </p>
            <p className="text-xs text-[var(--foreground-hint)] truncate">
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-[var(--foreground-hint)] hover:text-[var(--destructive)] transition-colors text-xs rounded-lg hover:bg-[var(--border)]"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-30 bg-[var(--background)] border-b border-[var(--border)] px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-[var(--foreground)]">
          GigFlow
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--foreground-muted)]"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-64 bg-[var(--card)] min-h-screen fixed border-r border-[var(--border)] flex-col">
          {sidebarContent}
        </aside>

        {/* Mobile sidebar */}
        <aside
          className={`lg:hidden fixed top-14 left-0 bottom-0 w-72 bg-[var(--card)] border-r border-[var(--border)] flex flex-col z-50 transition-transform duration-200 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </aside>

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
