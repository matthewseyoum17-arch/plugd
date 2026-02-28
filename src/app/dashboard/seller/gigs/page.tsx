import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCents, timeAgo } from "@/lib/utils";
import { Plus, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SellerGigsPage() {
  if (!isSupabaseConfigured) redirect("/login");
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: gigs } = await supabase
    .from("gigs")
    .select("*, categories(name)")
    .eq("seller_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">My Gigs</h1>
        <Link
          href="/dashboard/seller/gigs/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--cta)] text-white font-medium text-sm rounded-lg hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          Create Gig
        </Link>
      </div>

      {gigs && gigs.length > 0 ? (
        <div className="space-y-3">
          {gigs.map((gig) => {
            const statusColors: Record<string, string> = {
              active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
              draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
              paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
              denied: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            };

            return (
              <div
                key={gig.id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-28 h-20 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--background-secondary)]">
                  {gig.thumbnail_url ? (
                    <img
                      src={gig.thumbnail_url}
                      alt={gig.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[var(--foreground-hint)]">
                      No image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-[var(--foreground)] truncate text-sm">
                      {gig.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
                        statusColors[gig.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {gig.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                    {gig.categories?.name && <span>{gig.categories.name}</span>}
                    <span>From {formatCents(gig.price_basic_cents || 0)}</span>
                    {gig.average_rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-[var(--star)] text-[var(--star)]" />
                        {Number(gig.average_rating).toFixed(1)} ({gig.review_count})
                      </span>
                    )}
                    <span>{gig.orders_completed || 0} orders</span>
                    <span>{timeAgo(gig.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    href={`/gig/${gig.id}`}
                    className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition"
                  >
                    View
                  </Link>
                  <Link
                    href={`/dashboard/seller/gigs/${gig.id}/edit`}
                    className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--card)] border border-[var(--border)] rounded-xl">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            No gigs yet
          </h3>
          <p className="text-[var(--foreground-muted)] text-sm mb-4">
            Create your first gig and start selling your services.
          </p>
          <Link
            href="/dashboard/seller/gigs/new"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[var(--cta)] text-white font-medium text-sm rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            Create Your First Gig
          </Link>
        </div>
      )}
    </div>
  );
}
