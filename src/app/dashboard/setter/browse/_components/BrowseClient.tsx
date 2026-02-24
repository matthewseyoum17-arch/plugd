'use client'

import { useState } from 'react'
import { applyToListing } from '../actions'
import { Search, DollarSign, Users, ExternalLink, CheckCircle, ArrowUpDown, X } from 'lucide-react'

type Listing = {
  id: string
  title: string
  description: string | null
  ideal_customer: string | null
  commission_per_appointment: number
  commission_per_close: number
  company_name: string
  product_url: string | null
  created_at: string
  setter_count: number
}

type SortKey = 'newest' | 'commission_high' | 'commission_low'

export function BrowseClient({
  listings,
  appliedIds,
}: {
  listings: Listing[]
  appliedIds: string[]
}) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('newest')
  const [appliedSet, setAppliedSet] = useState<Set<string>>(new Set(appliedIds))
  const [modalListing, setModalListing] = useState<Listing | null>(null)
  const [detailListing, setDetailListing] = useState<Listing | null>(null)
  const [sampleEmail, setSampleEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const filtered = listings
    .filter((l) => {
      const q = search.toLowerCase()
      return (
        l.title.toLowerCase().includes(q) ||
        l.company_name.toLowerCase().includes(q) ||
        (l.ideal_customer || '').toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'commission_high') return b.commission_per_appointment - a.commission_per_appointment
      if (sortBy === 'commission_low') return a.commission_per_appointment - b.commission_per_appointment
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const handleApply = async () => {
    if (!modalListing) return
    setSubmitting(true)
    setError('')
    const result = await applyToListing(modalListing.id, sampleEmail)
    if (result.error) {
      if (result.error === 'Already applied') {
        setAppliedSet((prev) => { const next = new Set(Array.from(prev)); next.add(modalListing.id); return next })
        setModalListing(null)
        setSampleEmail('')
      } else {
        setError(result.error)
      }
    } else {
      setAppliedSet((prev) => { const next = new Set(Array.from(prev)); next.add(modalListing.id); return next })
      setModalListing(null)
      setSampleEmail('')
    }
    setSubmitting(false)
  }

  const openApplyModal = (listing: Listing) => {
    setDetailListing(null)
    setModalListing(listing)
    setError('')
    setSampleEmail('')
  }

  const formatDollars = (cents: number) => {
    const d = cents / 100
    return d % 1 === 0 ? `$${d}` : `$${d.toFixed(2)}`
  }

  const resultCount = filtered.length
  const totalListings = listings.length

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Browse Opportunities</h1>
        <p className="text-gray-500 text-sm">Find products to promote and earn commissions on every booked meeting.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, company, or target customer..."
            className="w-full bg-[#111] border border-[#222] text-white rounded-xl pl-10 pr-4 py-3 focus:border-[#00FF94]/50 focus:ring-1 focus:ring-[#00FF94]/50 focus:outline-none text-sm placeholder:text-gray-600 transition-all"
          />
        </div>
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="appearance-none bg-[#111] border border-[#222] text-gray-300 rounded-xl pl-10 pr-8 py-3 focus:border-[#00FF94]/50 focus:outline-none text-sm cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="commission_high">Highest commission</option>
            <option value="commission_low">Lowest commission</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-gray-500 text-xs mb-4">
        {search ? `${resultCount} of ${totalListings} listings` : `${totalListings} listings available`}
      </p>

      {/* Listing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((listing) => {
          const isApplied = appliedSet.has(listing.id)
          return (
            <div
              key={listing.id}
              className="group bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl overflow-hidden hover:border-[#00FF94]/30 transition-all duration-200 flex flex-col"
            >
              {/* Card Header — colored gradient band */}
              <div className="h-1.5 bg-gradient-to-r from-[#00FF94]/60 via-[#0088ff]/40 to-[#7722cc]/30" />

              <div className="p-5 flex flex-col flex-1">
                {/* Company & badges */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#00FF94]/10 border border-[#00FF94]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#00FF94] text-xs font-bold">
                        {listing.company_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm truncate">{listing.company_name}</span>
                  </div>
                  {isApplied && (
                    <span className="flex items-center gap-1 text-[#00FF94] text-xs font-medium flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Applied
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  className="text-white font-semibold text-base mb-2 line-clamp-2 cursor-pointer hover:text-[#00FF94] transition-colors"
                  onClick={() => setDetailListing(listing)}
                >
                  {listing.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                  {listing.ideal_customer || listing.description || 'No description provided'}
                </p>

                {/* Commission badges */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00FF94]/[0.08] border border-[#00FF94]/20">
                    <DollarSign className="w-3.5 h-3.5 text-[#00FF94]" />
                    <span className="text-[#00FF94] text-sm font-semibold">
                      {formatDollars(listing.commission_per_appointment)}
                    </span>
                    <span className="text-gray-500 text-xs">/appt</span>
                  </div>
                  {listing.commission_per_close > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0088ff]/[0.08] border border-[#0088ff]/20">
                      <DollarSign className="w-3.5 h-3.5 text-[#0088ff]" />
                      <span className="text-[#0088ff] text-sm font-semibold">
                        {formatDollars(listing.commission_per_close)}
                      </span>
                      <span className="text-gray-500 text-xs">/close</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {listing.setter_count} setter{listing.setter_count !== 1 ? 's' : ''}
                    </span>
                    {listing.product_url && (
                      <a
                        href={listing.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-[#00FF94] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Website
                      </a>
                    )}
                  </div>

                  {isApplied ? (
                    <button
                      onClick={() => setDetailListing(listing)}
                      className="text-gray-400 hover:text-white text-xs font-medium transition-colors"
                    >
                      View details
                    </button>
                  ) : (
                    <button
                      onClick={() => openApplyModal(listing)}
                      className="bg-[#00FF94] text-black font-semibold rounded-lg px-4 py-2 text-xs hover:brightness-90 transition-all"
                    >
                      Apply to Promote
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="text-gray-600 mb-2">No listings match your search.</div>
            <button onClick={() => setSearch('')} className="text-[#00FF94] text-sm hover:underline">
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Listing Detail Slide-Over */}
      {detailListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50" onClick={() => setDetailListing(null)}>
          <div
            className="bg-[#0e0e0e] border-l border-[#1a1a1a] w-full max-w-lg h-full overflow-y-auto animate-[slideIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient header */}
            <div className="h-2 bg-gradient-to-r from-[#00FF94] via-[#0088ff] to-[#7722cc]" />

            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{detailListing.company_name}</p>
                  <h2 className="text-2xl font-bold text-white">{detailListing.title}</h2>
                </div>
                <button onClick={() => setDetailListing(null)} className="text-gray-500 hover:text-white p-1 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Commission cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#00FF94]/[0.06] border border-[#00FF94]/20 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Per Appointment</p>
                  <p className="text-[#00FF94] text-2xl font-bold">{formatDollars(detailListing.commission_per_appointment)}</p>
                </div>
                <div className="bg-[#0088ff]/[0.06] border border-[#0088ff]/20 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Per Close</p>
                  <p className="text-[#0088ff] text-2xl font-bold">{formatDollars(detailListing.commission_per_close)}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-5">
                {detailListing.ideal_customer && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Target Customer</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{detailListing.ideal_customer}</p>
                  </div>
                )}
                {detailListing.description && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About This Product</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{detailListing.description}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {detailListing.setter_count} active setter{detailListing.setter_count !== 1 ? 's' : ''}
                  </span>
                  {detailListing.product_url && (
                    <a href={detailListing.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#00FF94] transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      Visit product
                    </a>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-[#1a1a1a]">
                {appliedSet.has(detailListing.id) ? (
                  <div className="flex items-center gap-2 text-[#00FF94] font-medium">
                    <CheckCircle className="w-5 h-5" />
                    You&apos;ve applied to this listing
                  </div>
                ) : (
                  <button
                    onClick={() => openApplyModal(detailListing)}
                    className="w-full bg-[#00FF94] text-black font-semibold rounded-xl px-6 py-3.5 hover:brightness-90 transition-all text-sm"
                  >
                    Apply to Promote This Product
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {modalListing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModalListing(null)}>
          <div className="bg-[#111] border border-[#222] rounded-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="h-1 bg-gradient-to-r from-[#00FF94] to-[#0088ff]" />
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-1">Apply to Promote</h3>
              <p className="text-gray-500 text-sm mb-1">{modalListing.title}</p>
              <p className="text-gray-600 text-xs mb-5">
                by {modalListing.company_name} &middot; {formatDollars(modalListing.commission_per_appointment)} per appointment
              </p>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded-xl text-red-400 text-sm mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {error}
                </div>
              )}

              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Sample Outreach Email
              </label>
              <textarea
                value={sampleEmail}
                onChange={(e) => setSampleEmail(e.target.value)}
                placeholder="Hi [Name],&#10;&#10;I noticed your company might benefit from..."
                className="bg-[#0a0a0a] border border-[#222] text-white rounded-xl px-4 py-3 focus:border-[#00FF94]/50 focus:ring-1 focus:ring-[#00FF94]/50 focus:outline-none w-full h-40 mb-5 text-sm placeholder:text-gray-600 resize-none transition-all"
                required
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setModalListing(null)}
                  className="flex-1 border border-[#222] text-gray-300 bg-transparent rounded-xl px-4 py-3 text-sm hover:bg-[#1a1a1a] transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={submitting || !sampleEmail.trim()}
                  className="flex-1 bg-[#00FF94] text-black font-semibold rounded-xl px-4 py-3 hover:brightness-90 text-sm disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </div>
  )
}
