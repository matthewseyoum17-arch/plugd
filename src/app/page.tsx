import Link from "next/link";
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, CheckCircle2, TrendingUp, Shield, Zap } from 'lucide-react'
import HeroBackground3D from '@/components/HeroBackground3D'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let dashboardUrl = '/login'
  if (user) {
    const role = user.user_metadata?.role
    dashboardUrl = `/dashboard/${role || 'setter'}`
  }

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#00FF94] selection:text-black font-sans overflow-x-hidden">
      
      {/* Background Noise / Film Grain */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.03]"
        style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png")' }}
      ></div>

      {/* 3D Low-Poly Background (CSS fallback if WebGL unavailable) */}
      <HeroBackground3D />

      {/* Navigation */}
      <nav className="fixed w-full z-40 border-b border-white/[0.05] bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#00FF94] to-[#06b6d4] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,148,0.3)]">
              <Zap className="w-3 h-3 text-black" />
            </div>
            Plugd
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link 
                href={dashboardUrl}
                className="text-sm px-4 py-2 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="text-sm px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup"
                  className="text-sm px-4 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors hidden sm:block"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center mt-12 sm:mt-24 mb-32 relative">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] mb-8 hover:bg-white/[0.05] transition-colors cursor-pointer">
            <span className="flex h-2 w-2 rounded-full bg-[#00FF94] animate-pulse"></span>
            <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">Plugd 2.0 is live</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-8 tracking-tighter leading-[1.1]">
            Connecting great products <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF94] via-[#00FF94] to-[#06b6d4] animate-gradient-x">
              with elite setters.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            The exclusive platform where high-ticket B2B founders list their products and top-tier appointment setters earn recurring commissions for qualified meetings.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/signup?role=founder" 
              className="group relative px-8 py-4 bg-white text-black font-semibold rounded-full hover:scale-105 transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer" />
              Start as Founder
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/signup?role=setter" 
              className="px-8 py-4 bg-white/[0.03] text-white border border-white/[0.08] font-semibold rounded-full hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300 w-full sm:w-auto text-center backdrop-blur-md"
            >
              Apply as Setter
            </Link>
          </div>

          {/* Social Proof / Trust */}
          <div className="mt-20 pt-10 border-t border-white/[0.05] flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-6 uppercase tracking-widest font-semibold">Trusted by elite B2B teams</p>
            <div className="flex gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholder logos - replace with actual SVGs later */}
              <div className="h-8 w-24 bg-white/20 rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="h-8 w-24 bg-white/20 rounded animate-pulse" style={{ animationDelay: '200ms' }}></div>
              <div className="h-8 w-24 bg-white/20 rounded animate-pulse hidden sm:block" style={{ animationDelay: '400ms' }}></div>
              <div className="h-8 w-24 bg-white/20 rounded animate-pulse hidden md:block" style={{ animationDelay: '600ms' }}></div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-32 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need to scale</h2>
            <p className="text-gray-400 text-lg">Purpose-built tools for modern B2B outbound teams.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="group relative bg-[#0a0a0a] border border-white/[0.05] rounded-3xl p-8 hover:border-[#00FF94]/30 hover:shadow-[0_0_30px_rgba(0,255,148,0.05)] transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF94]/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center mb-6 text-[#00FF94]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Curated Opportunities</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Access a vetted marketplace of high-ticket SaaS and agency offers. No more cold outreach for low-converting products.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-[#0a0a0a] border border-white/[0.05] rounded-3xl p-8 hover:border-[#06b6d4]/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.05)] transition-all duration-500 overflow-hidden md:-translate-y-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#06b6d4]/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center mb-6 text-[#06b6d4]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Performance Tracking</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Real-time analytics on your outreach, meeting show rates, and closed-won commissions all in one elegant dashboard.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-[#0a0a0a] border border-white/[0.05] rounded-3xl p-8 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.05)] transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center mb-6 text-purple-400">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Guaranteed Payouts</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Automated escrow and transparent payout tracking means you never have to chase down a founder for your commission again.
              </p>
            </div>

          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-5xl mx-auto mt-40 mb-20">
          <div className="relative rounded-3xl border border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-transparent p-10 md:p-20 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] opacity-[0.02]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#00FF94]/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 relative z-10">Ready to scale your revenue?</h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto relative z-10 font-light">
              Join hundreds of top founders and elite setters already using Plugd.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
              <Link 
                href="/signup" 
                className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] bg-black py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white/50">
            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white/50" />
            </div>
            <span className="font-semibold tracking-tight">Plugd</span>
          </div>
          <div className="text-sm text-gray-600">
            © 2026 Plugd Inc. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
