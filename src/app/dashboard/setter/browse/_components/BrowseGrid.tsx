'use client'

import { useState, useTransition, useMemo } from 'react'
import { applyToListing } from '@/app/actions'
import { Toast } from '@/components/ui/Toast'

type Listing = {
  id: string
  title: string
  description: string
  ideal_customer: string | null
  commission_per_appointment: number
  commission_per_close: number
  company_name: string
  founder_profiles: { company_name: string; verified?: boolean } | null
}

const CATEGORIES = ['All', 'AI Receptionist', 'Chatbot', 'Lead Gen', 'Other'] as const
const PAGE_SIZE = 20

function matchesCategory(title: string, category: string): boolean {
  if (category === 'All') return true
  const lower = title.toLowerCase()
  if (category === 'AI Receptionist') return lower.includes('receptionist') || lower.includes('ai phone') || lower.includes('voice')
  if (category === 'Chatbot') return lower.includes('chatbot') || lower.includes('chat bot') || lower.includes('conversational')
  if (category === 'Lead Gen') return lower.includes('lead') || lower.includes('outbound') || lower.includes('prospecting')
  return !matchesCategory(title, 'AI Receptionist') && !matchesCategory(title, 'Chatbot') && !matchesCategory(title, 'Lead Gen')
}

export function BrowseGrid({ listings, appliedIds }: { listings: Listing[]; appliedIds: string[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [appliedSet, setAppliedSet] = useState<Set<string>>(new Set(appliedIds))
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    return listings.filter(l => {
      const q = search.toLowerCase()
      const matchSearch = !q || l.title.toLowerCase().includes(q) || (l.ideal_customer || '').toLowerCase().includes(q)
      const matchCat = matchesCategory(l.title, category)
      return matchSearch && matchCat
    })
  }, [listings, search, category])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const handleApply = (listingId: string) => {
    setPendingId(listingId)
    startTransition(async () => {
      const result = await applyToListing(listingId)
      if (result.error) {
        if (result.error === 'Already applied') {
          setAppliedSet(prev => { const next = new Set(Array.from(prev)); next.add(listingId); return next })
        }
        setToast({ message: result.error, type: 'error' })
      } else {
        setAppliedSet(prev => { const next = new Set(Array.from(prev)); next.add(listingId); return next })
        setToast({ message: 'Application submitted!', type: 'success' })
      }
      setPendingId(null)
    })
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search listings by title or ideal customer..."
          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl focus:outline-none focus:border-[#00FF94] text-white placeholder:text-gray-600"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setVisibleCount(PAGE_SIZE) }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === cat
                ? 'bg-[#00FF94] text-black'
                : 'bg-[#1a1a1a] text-gray-400 border border-[#333] hover:border-[#00FF94]/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-12 text-center">
          <p className="text-gray-500">No listings match your search.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 browse-grid">
            {visible.map(listing => {
              const isApplied = appliedSet.has(listing.id)
              const isLoading = isPending && pendingId === listing.id

              return (
                <div
                  key={listing.id}
                  className="bg-[#1a1a1a] border border-[#222] rounded-xl p-5 flex flex-col hover:border-[#00FF94]/40 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(0,255,148,0.06)] transition-all duration-200"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-400 truncate">
                      {listing.founder_profiles?.company_name || listing.company_name}
                    </span>
                    {listing.founder_profiles?.verified && (
                      <span className="inline-flex items-center justify-center w-4 h-4 bg-[#00FF94]/20 rounded-full shrink-0" title="Verified">
                        <svg className="w-2.5 h-2.5 text-[#00FF94]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-semibold mb-2">{listing.title}</h3>

                  {/* Ideal customer */}
                  {listing.ideal_customer && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{listing.ideal_customer}</p>
                  )}

                  {/* Commission pills */}
                  <div className="flex gap-2 mb-4 mt-auto">
                    <span className="px-2.5 py-1 bg-[#00FF94]/10 text-[#00FF94] text-xs font-semibold rounded-full">
                      ${((listing.commission_per_appointment || 0) / 100).toFixed(0)}/appt
                    </span>
                    <span className="px-2.5 py-1 bg-[#222] text-gray-400 text-xs font-medium rounded-full">
                      ${((listing.commission_per_close || 0) / 100).toFixed(0)}/close
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="flex justify-end">
                    {isApplied ? (
                      <span className="px-4 py-2 text-[#00FF94] text-sm font-medium">Applied ✓</span>
                    ) : (
                      <button
                        onClick={() => handleApply(listing.id)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-[#00FF94] text-black text-sm font-semibold rounded-lg hover:brightness-90 transition-all disabled:opacity-50"
                      >
                        {isLoading ? 'Applying...' : 'Promote This'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                className="px-6 py-2.5 bg-transparent text-gray-400 border border-[#333] rounded-lg hover:border-[#00FF94]/50 hover:text-white transition-all text-sm"
              >
                Load More ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .browse-grid::-webkit-scrollbar { width: 6px; }
        .browse-grid::-webkit-scrollbar-track { background: transparent; }
        .browse-grid::-webkit-scrollbar-thumb { background: #00FF94; border-radius: 3px; }
      `}</style>
    </div>
  )
}
