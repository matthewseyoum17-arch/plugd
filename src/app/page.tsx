import Link from "next/link";
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let dashboardUrl = '/login'
  if (user) {
    const role = user.user_metadata?.role
    dashboardUrl = `/dashboard/${role || 'setter'}`
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#00FF94] selection:text-black font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold text-[#00FF94]" style={{ fontFamily: 'Syne, sans-serif' }}>
            Plugd
          </div>
          <div className="flex gap-4">
            {user ? (
              <Link 
                href={dashboardUrl}
                className="px-6 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] text-white font-medium rounded-lg hover:bg-[#2a2a2a] transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="px-6 py-2.5 text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup"
                  className="px-6 py-2.5 bg-[#00FF94] text-black font-semibold rounded-lg hover:bg-[#00cc76] transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center mt-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Connecting great products <br />
            <span className="text-[#00FF94]">with elite setters.</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            The platform where B2B founders list their products and top appointment setters earn commissions for qualified meetings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup?role=founder"
              className="px-8 py-4 bg-[#00FF94] text-black font-semibold rounded-xl hover:bg-[#00cc76] transition-colors text-lg"
            >
              I'm a Founder
            </Link>
            <Link 
              href="/signup?role=setter"
              className="px-8 py-4 bg-[#1a1a1a] border border-[#2a2a2a] text-white font-semibold rounded-xl hover:bg-[#2a2a2a] transition-colors text-lg"
            >
              I'm an Appointment Setter
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto mt-32 grid md:grid-cols-3 gap-8">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
            <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center mb-6 border border-green-800">
              <svg className="w-6 h-6 text-[#00FF94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">List your product</h3>
            <p className="text-gray-400 leading-relaxed">
              Founders can create listings with custom commission structures for appointments and closed deals.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
            <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center mb-6 border border-green-800">
              <svg className="w-6 h-6 text-[#00FF94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Find opportunities</h3>
            <p className="text-gray-400 leading-relaxed">
              Setters browse high-converting B2B products and apply to promote the ones that fit their network.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
            <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center mb-6 border border-green-800">
              <svg className="w-6 h-6 text-[#00FF94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Get paid directly</h3>
            <p className="text-gray-400 leading-relaxed">
              Transparent tracking of appointments and automated payout management when deals close.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] bg-[#111] py-12 text-center mt-20">
        <p className="text-gray-500">© 2026 Plugd. All rights reserved.</p>
      </footer>
    </div>
  );
}
