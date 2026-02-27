import { createClient } from "@/lib/supabase/server";
import { GigCard, GigCardSkeleton, type GigCardData } from "@/components/gig-card";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: { q?: string; category?: string; min?: string; max?: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toGigCard(row: any): GigCardData {
  return {
    id: row.id,
    title: row.title,
    thumbnail_url: row.thumbnail_url || null,
    price_basic_cents: row.price_basic_cents ?? 0,
    average_rating: row.average_rating ?? 0,
    review_count: row.review_count ?? 0,
    seller_id: row.users?.id || row.seller_id || "",
    seller_username: row.users?.username || "seller",
    seller_avatar: row.users?.avatar_url || null,
    seller_level: row.users?.seller_level || "",
    category_name: row.categories?.name || null,
  };
}

async function SearchResults({ q, category, min, max }: { q?: string; category?: string; min?: string; max?: string }) {
  const supabase = createClient();

  // Fetch categories for filter sidebar
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("display_order");

  // Build gigs query
  let query = supabase
    .from("gigs")
    .select("*, users(id, username, avatar_url, seller_level), categories(name)")
    .eq("status", "active");

  // Text search
  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  // Category filter
  if (category) {
    const cat = categories?.find((c) => c.slug === category);
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }

  // Price range filters
  if (min) {
    const minCents = Math.round(parseFloat(min) * 100);
    if (!isNaN(minCents)) query = query.gte("price_basic_cents", minCents);
  }
  if (max) {
    const maxCents = Math.round(parseFloat(max) * 100);
    if (!isNaN(maxCents)) query = query.lte("price_basic_cents", maxCents);
  }

  query = query.order("orders_completed", { ascending: false }).limit(40);

  const { data: gigs } = await query;
  const results: GigCardData[] = (gigs || []).map(toGigCard);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar filters */}
      <aside className="lg:w-56 flex-shrink-0">
        <h3 className="font-semibold text-sm text-[var(--foreground)] mb-3">Category</h3>
        <ul className="space-y-1.5">
          <li>
            <Link
              href={`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`}
              className={`text-sm block px-3 py-1.5 rounded-lg transition-colors ${
                !category
                  ? "bg-[var(--cta)] text-white font-medium"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]"
              }`}
            >
              All Categories
            </Link>
          </li>
          {(categories || []).map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/search?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  category: cat.slug,
                }).toString()}`}
                className={`text-sm block px-3 py-1.5 rounded-lg transition-colors ${
                  category === cat.slug
                    ? "bg-[var(--cta)] text-white font-medium"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]"
                }`}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Results */}
      <div className="flex-1">
        <p className="text-sm text-[var(--foreground-muted)] mb-6">
          {results.length} service{results.length !== 1 ? "s" : ""} found
          {q ? ` for "${q}"` : ""}
          {category ? ` in ${categories?.find((c) => c.slug === category)?.name || category}` : ""}
        </p>

        {results.length === 0 ? (
          <div className="text-center py-20">
            <SearchIcon className="w-12 h-12 text-[var(--foreground-hint)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No results found</h3>
            <p className="text-[var(--foreground-muted)] text-sm">
              {q ? `No services match "${q}". Try different keywords.` : "No services in this category yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {results.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category, min, max } = searchParams;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header with search form */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-2">
          {q ? `Results for "${q}"` : "Browse Services"}
        </h1>
        <form action="/search" method="GET" className="max-w-xl mt-4 flex">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2.5 rounded-l-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cta)]"
            />
          </div>
          <button
            type="submit"
            className="bg-[var(--cta)] text-white font-semibold px-5 py-2.5 rounded-r-lg hover:opacity-90 transition text-sm"
          >
            Search
          </button>
        </form>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-56 flex-shrink-0">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </aside>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <GigCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <SearchResults q={q} category={category} min={min} max={max} />
      </Suspense>
    </div>
  );
}
