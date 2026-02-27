import { createClient } from "@/lib/supabase/server";
import { GigCard, GigCardSkeleton, type GigCardData } from "@/components/gig-card";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface BrowsePageProps {
  searchParams: { category?: string; search?: string };
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

async function BrowseResults({
  category,
  search,
}: {
  category?: string;
  search?: string;
}) {
  const supabase = createClient();

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("display_order");

  // Build gigs query
  let query = supabase
    .from("gigs")
    .select("*, users(id, username, avatar_url, seller_level), categories(name)")
    .eq("status", "active");

  // Filter by category
  if (category) {
    const cat = categories?.find((c) => c.slug === category);
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }

  // Filter by search
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  query = query.order("orders_completed", { ascending: false }).limit(40);

  const { data: gigs } = await query;
  const results: GigCardData[] = (gigs || []).map(toGigCard);

  return (
    <>
      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
        <Link
          href="/browse"
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
            !category
              ? "bg-[var(--cta)] text-white border-[var(--cta)]"
              : "bg-[var(--card)] text-[var(--foreground-muted)] border-[var(--border)] hover:border-[var(--foreground-hint)] hover:text-[var(--foreground)]"
          }`}
        >
          All
        </Link>
        {(categories || []).map((cat) => (
          <Link
            key={cat.id}
            href={`/browse?category=${cat.slug}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              category === cat.slug
                ? "bg-[var(--cta)] text-white border-[var(--cta)]"
                : "bg-[var(--card)] text-[var(--foreground-muted)] border-[var(--border)] hover:border-[var(--foreground-hint)] hover:text-[var(--foreground)]"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            No services found
          </h3>
          <p className="text-[var(--foreground-muted)] text-sm">
            {search
              ? `No results for "${search}". Try a different search.`
              : "No services in this category yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
        </div>
      )}
    </>
  );
}

export default function BrowsePage({ searchParams }: BrowsePageProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)] mb-2">
          Browse Services
        </h1>
        <p className="text-[var(--foreground-muted)]">
          Find the perfect freelance service for your project.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <form action="/browse" method="GET" className="max-w-xl flex">
          <input
            type="text"
            name="search"
            defaultValue={searchParams.search || ""}
            placeholder="Search services..."
            className="flex-1 px-4 py-2.5 rounded-l-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cta)]"
          />
          {searchParams.category && (
            <input type="hidden" name="category" value={searchParams.category} />
          )}
          <button
            type="submit"
            className="bg-[var(--cta)] text-white font-semibold px-5 py-2.5 rounded-r-lg hover:opacity-90 transition text-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <GigCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <BrowseResults
          category={searchParams.category}
          search={searchParams.search}
        />
      </Suspense>
    </div>
  );
}
