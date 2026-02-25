'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

export function CategoryChips({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSlug = searchParams.get('category') || ''

  const handleClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === activeSlug || slug === '') {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    router.push(`/browse${params.toString() ? '?' + params.toString() : ''}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => handleClick('')}
        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
          !activeSlug
            ? 'bg-[#00FF94] text-black border-[#00FF94]'
            : 'bg-white/[0.03] text-gray-400 border-white/[0.08] hover:border-white/[0.15] hover:text-white'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleClick(cat.slug)}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
            activeSlug === cat.slug
              ? 'bg-[#00FF94] text-black border-[#00FF94]'
              : 'bg-white/[0.03] text-gray-400 border-white/[0.08] hover:border-white/[0.15] hover:text-white'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
