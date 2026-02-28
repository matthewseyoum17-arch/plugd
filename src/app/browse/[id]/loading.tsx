export default function GigDetailLoading() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Nav skeleton */}
      <nav className="sticky top-0 z-40 border-b border-white/[0.04] bg-black/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="w-24 h-6 bg-white/[0.06] rounded animate-pulse" />
          <div className="w-24 h-8 bg-white/[0.06] rounded-full animate-pulse" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="w-24 h-4 bg-white/[0.06] rounded animate-pulse mb-6" />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-[16/9] bg-white/[0.04] rounded-2xl animate-pulse" />
            <div className="space-y-3">
              <div className="w-24 h-5 bg-white/[0.06] rounded-full animate-pulse" />
              <div className="w-3/4 h-8 bg-white/[0.04] rounded animate-pulse" />
              <div className="w-full h-4 bg-white/[0.04] rounded animate-pulse" />
              <div className="w-5/6 h-4 bg-white/[0.04] rounded animate-pulse" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 bg-white/[0.02] border border-white/[0.06] rounded-xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/[0.06] animate-pulse" />
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-white/[0.06] rounded animate-pulse" />
                  <div className="w-16 h-3 bg-white/[0.04] rounded animate-pulse" />
                </div>
              </div>
              <div className="h-24 bg-[#ffffff]/[0.03] rounded-xl animate-pulse" />
              <div className="h-11 bg-white/[0.06] rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
