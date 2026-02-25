import Link from "next/link";
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, CheckCircle2, TrendingUp, Shield, Zap, Target, DollarSign, Users, Bot, Cloud, Megaphone, Code, MoreHorizontal } from 'lucide-react'
import HeroBackground3D from '@/components/HeroBackground3D'
import { GigCard, type GigCardData } from '@/components/gig-card'
import { ThemeToggle } from '@/components/theme-toggle'

export const dynamic = 'force-dynamic'

const categoryIcons: Record<string, React.ReactNode> = {
  'Bot': <Bot className="w-5 h-5" />,
  'Cloud': <Cloud className="w-5 h-5" />,
  'Megaphone': <Megaphone className="w-5 h-5" />,
  'Target': <Target className="w-5 h-5" />,
  'Code': <Code className="w-5 h-5" />,
  'DollarSign': <DollarSign className="w-5 h-5" />,
  'Users': <Users className="w-5 h-5" />,
  'MoreHorizontal': <MoreHorizontal className="w-5 h-5" />,
}

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let dashboardUrl = '/login'
  if (user) {
    const role = user.user_metadata?.role
    dashboardUrl = `/dashboard/${role || 'setter'}`
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon, description')
    .order('sort_order')

  // Fetch featured listings (top 6)
  const { data: listings } = await supabase
    .from('listings')
    .select('*, categories(name, slug), users!listings_company_id_fkey(full_name), setter_applications(id, status)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch reviews for rating
  const companyIds = Array.from(new Set(listings?.map(l => l.company_id) || []))
  const reviewsMap: Record<string, { avg: number; count: number }> = {}
  if (companyIds.length > 0) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('reviewee_id, rating')
      .in('reviewee_id', companyIds)
    if (reviews) {
      const grouped: Record<string, number[]> = {}
      reviews.forEach(r => {
        if (!grouped[r.reviewee_id]) grouped[r.reviewee_id] = []
        grouped[r.reviewee_id].push(r.rating)
      })
      Object.entries(grouped).forEach(([id, ratings]) => {
        reviewsMap[id] = {
          avg: ratings.reduce((a, b) => a + b, 0) / ratings.length,
          count: ratings.length,
        }
      })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gigs: GigCardData[] = (listings || []).map((l: any) => ({
    id: l.id,
    title: l.title,
    description: l.description || '',
    cover_image_url: l.cover_image_url || null,
    commission_per_appointment: l.commission_per_appointment || 0,
    commission_per_close: l.commission_per_close || 0,
    company_name: l.company_name || 'Company',
    category_name: l.categories?.name || null,
    category_slug: l.categories?.slug || null,
    avg_rating: reviewsMap[l.company_id]?.avg || null,
    review_count: reviewsMap[l.company_id]?.count || 0,
    setter_count: l.setter_applications?.filter((a: { status: string }) => a.status === 'approved').length || 0,
    created_at: l.created_at,
    seller_name: l.users?.full_name || 'Seller',
    ideal_customer: l.ideal_customer || null,
  }))

  return (
    <div className="relative min-h-screen bg-[#030305] text-white selection:bg-[#00FF94] selection:text-black font-sans overflow-x-hidden">

      {/* Film grain overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.02] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")' }} />

      {/* 3D Torus Knot Background */}
      <HeroBackground3D />

      {/* Navigation */}
      <nav className="fixed w-full z-40 border-b border-white/[0.04] bg-black/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00FF94] to-[#0088ff] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,148,0.25)]">
              <Zap className="w-3.5 h-3.5 text-black" />
            </div>
            Plugd
          </div>
          <div className="flex items-center gap-3">
            <Link href="/browse" className="text-sm px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors hidden sm:block">
              Browse
            </Link>
            <ThemeToggle />
            {user ? (
              <Link href={dashboardUrl}
                className="text-sm px-5 py-2 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login"
                  className="text-sm px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors">
                  Sign In
                </Link>
                <Link href="/signup"
                  className="text-sm px-5 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all hidden sm:block shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10">

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-32 relative">
          <div className="max-w-5xl mx-auto text-center relative">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-10 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#00FF94] animate-pulse" />
              <span className="text-xs font-semibold text-gray-300 tracking-widest uppercase">Now in Beta</span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] font-extrabold mb-8 tracking-[-0.04em] leading-[1.05]">
              <span className="block text-white">WE BUILD</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00FF94] via-[#0088ff] to-[#7722cc] animate-gradient-x">
                DIGITAL REALITIES
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-14 max-w-2xl mx-auto leading-relaxed font-light">
              The exclusive marketplace where B2B founders connect with elite appointment setters.
              List your product. Get qualified meetings. Pay only for results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup?role=founder"
                className="group relative px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <span className="relative z-10 flex items-center gap-2">
                  Start as Founder
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="/signup?role=setter"
                className="px-8 py-4 bg-white/[0.03] text-white border border-white/[0.08] font-semibold rounded-full hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300 w-full sm:w-auto text-center backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                Apply as Setter
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
          </div>
        </section>

        {/* Browse Categories */}
        {categories && categories.length > 0 && (
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-[#00FF94] text-xs font-bold tracking-[0.3em] uppercase mb-4">Explore</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Browse by Category</h2>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide justify-center flex-wrap">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/browse?category=${cat.slug}`}
                    className="group flex-shrink-0 bg-white/[0.02] border border-white/[0.06] rounded-2xl px-6 py-5 backdrop-blur-xl hover:border-[#00FF94]/30 hover:bg-white/[0.04] transition-all duration-300 text-center min-w-[140px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:text-[#00FF94] transition-colors">
                      {categoryIcons[cat.icon || ''] || <MoreHorizontal className="w-5 h-5" />}
                    </div>
                    <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{cat.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Listings */}
        {gigs.length > 0 && (
          <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="text-[#0088ff] text-xs font-bold tracking-[0.3em] uppercase mb-3">Featured</p>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Latest Listings</h2>
                </div>
                <Link href="/browse" className="text-sm text-gray-400 hover:text-[#00FF94] font-medium transition-colors flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gigs.map((gig) => (
                  <GigCard key={gig.id} gig={gig} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-[#00FF94] text-xs font-bold tracking-[0.3em] uppercase mb-4">How It Works</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Three steps to revenue</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', icon: <Target className="w-6 h-6" />, title: 'List Your Product', desc: 'Founders create a listing with commission rates, ideal customer profiles, and pitch kits for their B2B product.', color: '#00FF94' },
                { step: '02', icon: <Users className="w-6 h-6" />, title: 'Setters Apply', desc: 'Elite appointment setters browse listings, submit sample outreach, and get approved to promote your product.', color: '#0088ff' },
                { step: '03', icon: <DollarSign className="w-6 h-6" />, title: 'Earn on Results', desc: 'Setters book qualified meetings via Calendly. Founders confirm, and payouts are processed automatically.', color: '#7722cc' },
              ].map((item) => (
                <div key={item.step} className="group relative">
                  <div className="absolute -top-4 -left-2 text-7xl font-black text-white/[0.03] select-none">{item.step}</div>
                  <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-white/[0.08]"
                      style={{ background: `${item.color}10`, color: item.color }}>
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-[#0088ff] text-xs font-bold tracking-[0.3em] uppercase mb-4">Platform</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need to scale</h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">Purpose-built tools for modern B2B outbound teams.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="group relative bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 backdrop-blur-xl hover:border-[#00FF94]/30 hover:shadow-[0_0_40px_rgba(0,255,148,0.06)] transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#00FF94]/[0.04] rounded-bl-full -mr-20 -mt-20 transition-transform group-hover:scale-150 duration-700" />
                <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center mb-6 text-[#00FF94]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Curated Opportunities</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Access a vetted marketplace of high-ticket SaaS and agency offers. No more cold outreach for low-converting products.
                </p>
              </div>

              <div className="group relative bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 backdrop-blur-xl hover:border-[#0088ff]/30 hover:shadow-[0_0_40px_rgba(0,136,255,0.06)] transition-all duration-500 overflow-hidden md:-translate-y-4">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#0088ff]/[0.04] rounded-bl-full -mr-20 -mt-20 transition-transform group-hover:scale-150 duration-700" />
                <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center mb-6 text-[#0088ff]">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Performance Tracking</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Real-time analytics on your outreach, meeting show rates, and closed-won commissions all in one elegant dashboard.
                </p>
              </div>

              <div className="group relative bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 backdrop-blur-xl hover:border-[#7722cc]/30 hover:shadow-[0_0_40px_rgba(119,34,204,0.06)] transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#7722cc]/[0.04] rounded-bl-full -mr-20 -mt-20 transition-transform group-hover:scale-150 duration-700" />
                <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center mb-6 text-[#7722cc]">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Guaranteed Payouts</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Automated escrow and transparent payout tracking means you never have to chase down a founder for your commission again.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Two-Column Split */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
            <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-10 backdrop-blur-xl overflow-hidden group hover:border-[#00FF94]/20 transition-all duration-500">
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#00FF94]/[0.05] rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-700" />
              <p className="text-[#00FF94] text-xs font-bold tracking-[0.2em] uppercase mb-6">For Founders</p>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Stop hiring SDRs.<br />Start paying for meetings.</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">List your product once. Get a vetted network of setters promoting it. Pay commissions only when qualified appointments are confirmed.</p>
              <Link href="/signup?role=founder" className="inline-flex items-center gap-2 text-[#00FF94] font-semibold hover:gap-3 transition-all">
                List your product <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-10 backdrop-blur-xl overflow-hidden group hover:border-[#0088ff]/20 transition-all duration-500">
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#0088ff]/[0.05] rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-700" />
              <p className="text-[#0088ff] text-xs font-bold tracking-[0.2em] uppercase mb-6">For Setters</p>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Your outreach skills<br />deserve real commissions.</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">Browse high-ticket offers, pick the ones you believe in, and earn $25–$500+ per qualified meeting you book. No cold-calling required.</p>
              <Link href="/signup?role=setter" className="inline-flex items-center gap-2 text-[#0088ff] font-semibold hover:gap-3 transition-all">
                Start earning <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.02] p-12 md:p-20 overflow-hidden text-center backdrop-blur-xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-gradient-to-r from-[#00FF94]/10 via-[#0088ff]/10 to-[#7722cc]/10 blur-[100px] rounded-full pointer-events-none" />
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 relative z-10">Ready to scale your revenue?</h2>
              <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto relative z-10 font-light">
                Join founders and setters already using Plugd to close more deals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
                <Link href="/signup"
                  className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.15)]">
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-black/60 py-12 relative z-10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white/40">
            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white/40" />
            </div>
            <span className="font-bold tracking-tight">Plugd</span>
          </div>
          <div className="text-sm text-gray-600">
            &copy; 2026 Plugd Inc. All rights reserved.
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
