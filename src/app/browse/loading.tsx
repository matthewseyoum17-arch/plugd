export default function BrowseLoading() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Nav skeleton */}
      <nav className="sticky top-0 z-40 border-b border-white/[0.04] bg-black/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="w-24 h-6 bg-white/[0.06] rounded animate-pulse" />
          <div className="flex gap-3">
            <div className="w-16 h-8 bg-white/[0.06] rounded-full animate-pulse" />
            <div className="w-24 h-8 bg-white/[0.06] rounded-full animate-pulse" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="w-24 h-4 bg-white/[0.06] rounded animate-pulse mb-4" />
          <div className="w-64 h-8 bg-white/[0.06] rounded animate-pulse mb-3" />
          <div className="w-96 h-5 bg-white/[0.06] rounded animate-pulse" />
        </div>

        {/* Search skeleton */}
        <div className="mb-8 max-w-3xl mx-auto">
          <div className="w-full h-12 bg-white/[0.04] border border-white/[0.06] rounded-xl animate-pulse" />
        </div>

        {/* Category chips skeleton */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-20 h-8 bg-white/[0.04] rounded-full animate-pulse" />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden"
            >
              <div className="aspect-[16/10] bg-white/[0.04] animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/[0.06] animate-pulse" />
                  <div className="w-20 h-3 bg-white/[0.04] rounded animate-pulse" />
                </div>
                <div className="w-full h-4 bg-white/[0.04] rounded animate-pulse" />
                <div className="w-2/3 h-3 bg-white/[0.04] rounded animate-pulse" />
                <div className="border-t border-white/[0.06] pt-3 flex justify-between">
                  <div className="w-16 h-3 bg-white/[0.04] rounded animate-pulse" />
                  <div className="w-20 h-4 bg-white/[0.04] rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
