import { createClient } from '@/lib/supabase/server'
import { GigCard, type GigCardData } from '@/components/gig-card'
import { SearchBar } from '@/components/search-bar'
import { CategoryChips } from '@/components/category-chips'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export const dynamic = 'force-dynamic'

interface BrowsePageProps {
  searchParams: { category?: string; search?: string }
}

async function BrowseResults({
  category,
  search,
}: {
  category?: string
  search?: string
}) {
  const supabase = createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('sort_order')

  // Build listings query
  let query = supabase
    .from('listings')
    .select(
      '*, categories(name, slug), users!listings_company_id_fkey(full_name), setter_applications(id, status)'
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Filter by category
  if (category) {
    const cat = categories?.find((c) => c.slug === category)
    if (cat) {
      query = query.eq('category_id', cat.id)
    }
  }

  // Filter by search
  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { data: listings } = await query

  // Fetch reviews for rating info
  const companyIds = Array.from(new Set(listings?.map((l) => l.company_id) || []))
  const reviewsMap: Record<string, { avg: number; count: number }> = {}

  if (companyIds.length > 0) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('reviewee_id, rating')
      .in('reviewee_id', companyIds)

    if (reviews) {
      const grouped: Record<string, number[]> = {}
      reviews.forEach((r) => {
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
    setter_count:
      l.setter_applications?.filter(
        (a: { status: string }) => a.status === 'approved'
      ).length || 0,
    created_at: l.created_at,
    seller_name: l.users?.full_name || 'Seller',
    ideal_customer: l.ideal_customer || null,
  }))

  return (
    <>
      <Suspense fallback={null}>
        <CategoryChips categories={categories || []} />
      </Suspense>

      {gigs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No listings found
          </h3>
          <p className="text-gray-500 text-sm">
            {search
              ? `No results for "${search}". Try a different search.`
              : 'No listings in this category yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {gigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
        </div>
      )}
    </>
  )
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const supabase = createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('sort_order')

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-white/[0.04] bg-black/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-black" />
            </div>
            Plugd
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm px-5 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all hidden sm:block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Browse Listings
          </h1>
          <p className="text-gray-400 text-lg">
            Find high-ticket products to promote and earn commissions.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <Suspense fallback={null}>
            <SearchBar categories={categories || []} />
          </Suspense>
        </div>

        {/* Results */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden"
                >
                  <div className="aspect-[16/10] bg-white/[0.04] animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-white/[0.04] rounded animate-pulse w-2/3" />
                    <div className="h-4 bg-white/[0.04] rounded animate-pulse" />
                    <div className="h-3 bg-white/[0.04] rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <BrowseResults
            category={searchParams.category}
            search={searchParams.search}
          />
        </Suspense>
      </main>
    </div>
  )
}
