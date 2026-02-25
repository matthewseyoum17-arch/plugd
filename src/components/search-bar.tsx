'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export function SearchBar({
  categories,
}: {
  categories: { id: string; name: string; slug: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  )

  const updateUrl = useCallback(
    (s: string, cat: string) => {
      const params = new URLSearchParams()
      if (s) params.set('search', s)
      if (cat) params.set('category', cat)
      router.push(`/browse${params.toString() ? '?' + params.toString() : ''}`)
    },
    [router]
  )

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrl(search, selectedCategory)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, selectedCategory, updateUrl])

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="w-full pl-12 pr-10 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-[#00FF94]/50 focus:ring-1 focus:ring-[#00FF94]/50 text-white placeholder-gray-500 text-sm backdrop-blur-xl"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category select */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-gray-300 focus:outline-none focus:border-[#00FF94]/50 focus:ring-1 focus:ring-[#00FF94]/50 backdrop-blur-xl appearance-none cursor-pointer min-w-[180px]"
        >
          <option value="" className="bg-[#111]">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug} className="bg-[#111]">
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
