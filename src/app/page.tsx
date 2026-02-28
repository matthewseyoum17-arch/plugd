import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Search, ShieldCheck, ShoppingBag } from "lucide-react";
import { GigCard, type GigCardData } from "@/components/gig-card";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toGigCardData(row: any): GigCardData {
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

export default async function Home() {
  let categories: { id: string; name: string; slug: string }[] = [];
  let featuredGigs: GigCardData[] = [];
  let trendingGigs: GigCardData[] = [];

  if (isSupabaseConfigured) {
    try {
      const supabase = createClient();

      const { data: cats } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");
      categories = cats || [];

      let { data: featuredRaw } = await supabase
        .from("gigs")
        .select("*, users(id, username, avatar_url, seller_level), categories(name)")
        .eq("status", "active")
        .eq("is_featured", true)
        .limit(8);

      if (!featuredRaw || featuredRaw.length === 0) {
        const { data: fallback } = await supabase
          .from("gigs")
          .select("*, users(id, username, avatar_url, seller_level), categories(name)")
          .eq("status", "active")
          .order("orders_completed", { ascending: false })
          .limit(8);
        featuredRaw = fallback;
      }

      const { data: trendingRaw } = await supabase
        .from("gigs")
        .select("*, users(id, username, avatar_url, seller_level), categories(name)")
        .eq("status", "active")
        .order("average_rating", { ascending: false })
        .limit(8);

      featuredGigs = (featuredRaw || []).map(toGigCardData);
      trendingGigs = (trendingRaw || []).map(toGigCardData);
    } catch {
      // Supabase not reachable — show empty state
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[var(--background-secondary)] py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            Find the perfect freelance services for your business
          </h1>
          <p className="text-[var(--foreground-muted)] text-lg mt-4">
            Millions of freelancers are ready to help. Find the right one.
          </p>

          {/* Search form */}
          <form
            action="/search"
            method="GET"
            className="max-w-2xl mx-auto mt-8 flex"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" />
              <input
                type="text"
                name="q"
                placeholder='Try "website design"'
                className="w-full pl-10 pr-4 py-3 rounded-l-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--cta)]"
              />
            </div>
            <button
              type="submit"
              className="bg-[var(--cta)] text-white font-semibold px-6 py-3 rounded-r-lg hover:opacity-90 transition"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <h2 className="font-semibold text-2xl mb-8 text-[var(--foreground)]">
          Popular Categories
        </h2>
        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((cat: { id: string; name: string; slug: string }) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 hover:shadow-md transition block"
              >
                <div className="w-12 h-12 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center mb-3 text-lg font-bold text-[var(--foreground)]">
                  {cat.name.charAt(0)}
                </div>
                <p className="font-medium text-[var(--foreground)]">{cat.name}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[var(--foreground-muted)]">
            No categories available yet.
          </p>
        )}
      </section>

      {/* Featured Gigs */}
      <section className="py-16 bg-[var(--background-secondary)]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-semibold text-2xl mb-8 text-[var(--foreground)]">
            Featured Services
          </h2>
          {featuredGigs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredGigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          ) : (
            <p className="text-[var(--foreground-muted)]">
              No featured services yet. Check back soon!
            </p>
          )}
        </div>
      </section>

      {/* Trending */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-semibold text-2xl mb-8 text-[var(--foreground)]">
            Trending Services
          </h2>
          {trendingGigs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trendingGigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          ) : (
            <p className="text-[var(--foreground-muted)]">
              No trending services yet. Check back soon!
            </p>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 max-w-5xl mx-auto text-center px-6">
        <h2 className="font-semibold text-2xl mb-8 text-[var(--foreground)]">
          How GigFlow works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <Search className="w-10 h-10 text-[var(--cta)] mb-4" />
            <h3 className="font-semibold text-lg text-[var(--foreground)] mb-2">
              Find
            </h3>
            <p className="text-[var(--foreground-muted)]">
              Search for any service you need
            </p>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-10 h-10 text-[var(--cta)] mb-4" />
            <h3 className="font-semibold text-lg text-[var(--foreground)] mb-2">
              Compare
            </h3>
            <p className="text-[var(--foreground-muted)]">
              Compare offers, reviews and portfolios
            </p>
          </div>
          <div className="flex flex-col items-center">
            <ShoppingBag className="w-10 h-10 text-[var(--cta)] mb-4" />
            <h3 className="font-semibold text-lg text-[var(--foreground)] mb-2">
              Order
            </h3>
            <p className="text-[var(--foreground-muted)]">
              Place an order and get it delivered
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
