import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Star,
  Users,
  ExternalLink,
  MapPin,
  DollarSign,
  CheckCircle2,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCents, timeAgo, getInitials } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { ApplyButton } from './apply-button'

export const dynamic = 'force-dynamic'

export default async function GigDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch listing with related data
  const { data: listing, error } = await supabase
    .from('listings')
    .select(
      '*, categories(name, slug), users!listings_company_id_fkey(id, full_name, email), setter_applications(id, status, setter_id)'
    )
    .eq('id', params.id)
    .single()

  if (error || !listing) notFound()

  // Fetch founder profile
  const { data: founderProfile } = await supabase
    .from('founder_profiles')
    .select('*')
    .eq('founder_id', listing.company_id)
    .single()

  // Fetch reviews for this founder
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, users!reviews_reviewer_id_fkey(full_name)')
    .eq('reviewee_id', listing.company_id)
    .order('created_at', { ascending: false })
    .limit(10)

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null

  const setterCount =
    listing.setter_applications?.filter(
      (a: { status: string }) => a.status === 'approved'
    ).length || 0

  // Check if current user already applied
  const userApplied = user
    ? listing.setter_applications?.some(
        (a: { setter_id: string }) => a.setter_id === user.id
      )
    : false

  const userRole = user?.user_metadata?.role

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-white/[0.04] bg-black/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ffffff] to-[#a1a1aa] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-black" />
            </div>
            Plugd
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link
                href={`/dashboard/${userRole || 'setter'}`}
                className="text-sm px-5 py-2 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="text-sm px-5 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content — 2 cols */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cover image */}
            <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-white/[0.06]">
              {listing.cover_image_url ? (
                <img
                  src={listing.cover_image_url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#ffffff]/10 via-[#a1a1aa]/10 to-[#71717a]/10 flex items-center justify-center">
                  <div className="text-6xl font-black text-white/[0.06] select-none">
                    {listing.company_name?.slice(0, 3).toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            {/* Title + meta */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                {listing.categories?.name && (
                  <Badge>{listing.categories.name}</Badge>
                )}
                {setterCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    {setterCount} setter{setterCount !== 1 ? 's' : ''} promoting
                  </div>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                {listing.title}
              </h1>

              <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {/* Details grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {listing.ideal_customer && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#ffffff]" />
                    <span className="text-sm font-semibold text-white">
                      Ideal Customer
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {listing.ideal_customer}
                  </p>
                </div>
              )}

              {listing.qualified_meeting_definition && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#a1a1aa]" />
                    <span className="text-sm font-semibold text-white">
                      Qualified Meeting
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {listing.qualified_meeting_definition}
                  </p>
                </div>
              )}

              {(listing.commission_per_appointment > 0 ||
                listing.commission_per_close > 0) && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-[#ffffff]" />
                    <span className="text-sm font-semibold text-white">
                      Commission Rates
                    </span>
                  </div>
                  <div className="space-y-1">
                    {listing.commission_per_appointment > 0 && (
                      <p className="text-sm text-gray-400">
                        <span className="text-[#ffffff] font-semibold">
                          {formatCents(listing.commission_per_appointment)}
                        </span>{' '}
                        per meeting
                      </p>
                    )}
                    {listing.commission_per_close > 0 && (
                      <p className="text-sm text-gray-400">
                        <span className="text-[#ffffff] font-semibold">
                          {formatCents(listing.commission_per_close)}
                        </span>{' '}
                        per close
                      </p>
                    )}
                  </div>
                </div>
              )}

              {listing.product_url && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="w-4 h-4 text-[#71717a]" />
                    <span className="text-sm font-semibold text-white">
                      Product
                    </span>
                  </div>
                  <a
                    href={listing.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#a1a1aa] hover:underline break-all"
                  >
                    {listing.product_url}
                  </a>
                </div>
              )}
            </div>

            {/* Reviews section */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                Reviews
                {avgRating && (
                  <span className="flex items-center gap-1 text-sm font-normal text-gray-400">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {avgRating.toFixed(1)} ({reviews?.length})
                  </span>
                )}
              </h2>

              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffffff]/20 to-[#a1a1aa]/20 border border-white/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">
                              {getInitials(
                                review.users?.full_name || 'Anonymous'
                              )}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {review.users?.full_name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {timeAgo(review.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-400 mt-2">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No reviews yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar — 1 col */}
          <div className="space-y-6">
            {/* Seller card */}
            <div className="sticky top-24 space-y-6">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffffff]/20 to-[#a1a1aa]/20 border border-white/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {getInitials(
                        listing.users?.full_name || listing.company_name || 'S'
                      )}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {listing.users?.full_name || 'Seller'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {listing.company_name}
                    </p>
                  </div>
                </div>

                {founderProfile?.headline && (
                  <p className="text-sm text-gray-400 mb-4">
                    {founderProfile.headline}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {avgRating && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Rating</span>
                      <span className="flex items-center gap-1 text-white">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        {avgRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {founderProfile?.location && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Location</span>
                      <span className="text-white">
                        {founderProfile.location}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Listed</span>
                    <span className="text-white">
                      {timeAgo(listing.created_at)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-4 space-y-3">
                  {/* Commission highlight */}
                  <div className="bg-[#ffffff]/[0.06] border border-[#ffffff]/20 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Earn up to</p>
                    <p className="text-2xl font-bold text-[#ffffff]">
                      {listing.commission_per_close > 0
                        ? formatCents(listing.commission_per_close)
                        : listing.commission_per_appointment > 0
                          ? formatCents(listing.commission_per_appointment)
                          : '$0'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {listing.commission_per_close > 0
                        ? 'per closed deal'
                        : 'per qualified meeting'}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <ApplyButton
                    listingId={listing.id}
                    isLoggedIn={!!user}
                    userRole={userRole}
                    alreadyApplied={userApplied}
                  />

                  {listing.pitch_kit_url && (
                    <a
                      href={listing.pitch_kit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 bg-white/[0.03] border border-white/[0.08] text-white font-medium rounded-xl hover:bg-white/[0.06] transition-all text-sm text-center flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Pitch Kit
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
