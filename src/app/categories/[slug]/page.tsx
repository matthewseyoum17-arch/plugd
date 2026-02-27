import { createClient } from "@/lib/supabase/server";
import { GigCard, GigCardSkeleton, type GigCardData } from "@/components/gig-card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

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

async function CategoryGigs({ slug }: { slug: string }) {
  const supabase = createClient();

  // Fetch the category
  const { data: category, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !category) notFound();

  // Fetch gigs in this category
  const { data: gigs } = await supabase
    .from("gigs")
    .select("*, users(id, username, avatar_url, seller_level), categories(name)")
    .eq("status", "active")
    .eq("category_id", category.id)
    .order("orders_completed", { ascending: false })
    .limit(40);

  // Fetch all categories for sidebar
  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("display_order");

  const results: GigCardData[] = (gigs || []).map(toGigCard);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--foreground)] font-medium">{category.name}</span>
      </nav>

      {/* Heading */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-2">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-[var(--foreground-muted)]">{category.description}</p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Category sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          <h3 className="font-semibold text-sm text-[var(--foreground)] mb-3">Categories</h3>
          <ul className="space-y-1.5">
            {(allCategories || []).map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/categories/${cat.slug}`}
                  className={`text-sm block px-3 py-1.5 rounded-lg transition-colors ${
                    cat.slug === slug
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

        {/* Results grid */}
        <div className="flex-1">
          <p className="text-sm text-[var(--foreground-muted)] mb-6">
            {results.length} service{results.length !== 1 ? "s" : ""} available
          </p>

          {results.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                No services yet
              </h3>
              <p className="text-[var(--foreground-muted)] text-sm">
                Be the first to offer a service in {category.name}!
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
    </>
  );
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Suspense
        fallback={
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mb-10" />
            <div className="flex flex-col lg:flex-row gap-8">
              <aside className="lg:w-56 flex-shrink-0">
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
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
          </div>
        }
      >
        <CategoryGigs slug={params.slug} />
      </Suspense>
    </div>
  );
}
