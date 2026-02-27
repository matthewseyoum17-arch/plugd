"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const categories = [
  { name: "Graphics & Design", href: "/search?q=graphics+design" },
  { name: "Programming & Tech", href: "/search?q=programming+tech" },
  { name: "Digital Marketing", href: "/search?q=digital+marketing" },
  { name: "Video & Animation", href: "/search?q=video+animation" },
  { name: "Writing & Translation", href: "/search?q=writing+translation" },
  { name: "Music & Audio", href: "/search?q=music+audio" },
  { name: "Business", href: "/search?q=business" },
  { name: "AI Services", href: "/search?q=ai+services" },
];

export function Navbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setAvatarDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      setSearchTerm("");
      setMobileMenuOpen(false);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setAvatarDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  }

  const userInitial = user?.user_metadata?.full_name
    ? (user.user_metadata.full_name as string).charAt(0).toUpperCase()
    : user?.email
      ? user.email.charAt(0).toUpperCase()
      : "U";

  const dashboardHref = user
    ? `/dashboard/${user.user_metadata?.role || "setter"}`
    : "/login";

  return (
    <header className="sticky top-0 z-50 bg-[var(--background)] border-b border-[var(--border)]">
      {/* Main nav bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Left: Logo */}
        <Link
          href="/"
          className="flex-shrink-0 font-bold text-xl text-[var(--foreground)] hover:opacity-80 transition-opacity"
        >
          GigFlow
        </Link>

        {/* Center: Search bar (hidden on mobile) */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-xl mx-auto items-center relative"
        >
          <Search className="absolute left-3 w-4 h-4 text-[var(--foreground-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search services...'
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cta)] focus:border-transparent transition-shadow"
          />
        </form>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto md:ml-0">
          {/* Dark mode toggle (visible when logged in) */}
          {user && mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--border)] transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[var(--foreground)]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--foreground)]" />
              )}
            </button>
          )}

          {user ? (
            /* Logged in: avatar dropdown */
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                className="w-9 h-9 rounded-full bg-[var(--cta)] text-white flex items-center justify-center text-sm font-semibold hover:opacity-90 transition-opacity"
                aria-label="User menu"
              >
                {userInitial}
              </button>

              {avatarDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-lg py-1 z-50">
                  <Link
                    href={dashboardHref}
                    onClick={() => setAvatarDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[var(--foreground-muted)]" />
                    Dashboard
                  </Link>
                  <Link
                    href={`${dashboardHref}/profile`}
                    onClick={() => setAvatarDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
                  >
                    <User className="w-4 h-4 text-[var(--foreground-muted)]" />
                    Profile
                  </Link>
                  <div className="border-t border-[var(--border)] my-1" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-[var(--border)] transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged out: Sign In + Join */
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium px-4 py-2 bg-[var(--cta)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Join
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--border)] transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[var(--foreground)]" />
            ) : (
              <Menu className="w-5 h-5 text-[var(--foreground)]" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[var(--border)] bg-[var(--background)] px-4 pb-4">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="relative mt-3 mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cta)] focus:border-transparent"
            />
          </form>

          {user ? (
            <div className="flex flex-col gap-1">
              {/* Dark mode toggle */}
              {mounted && (
                <button
                  onClick={() =>
                    setTheme(theme === "dark" ? "light" : "dark")
                  }
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--border)] rounded-lg transition-colors"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-[var(--foreground-muted)]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[var(--foreground-muted)]" />
                  )}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              )}
              <Link
                href={dashboardHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--border)] rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[var(--foreground-muted)]" />
                Dashboard
              </Link>
              <Link
                href={`${dashboardHref}/profile`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--border)] rounded-lg transition-colors"
              >
                <User className="w-4 h-4 text-[var(--foreground-muted)]" />
                Profile
              </Link>
              <div className="border-t border-[var(--border)] my-1" />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-[var(--border)] rounded-lg transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[var(--foreground)] px-3 py-2.5 hover:bg-[var(--border)] rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-center px-4 py-2.5 bg-[var(--cta)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Category bar */}
      <div className="border-t border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide py-3 -mx-4 px-4 sm:-mx-6 sm:px-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="flex-shrink-0 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] whitespace-nowrap transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
