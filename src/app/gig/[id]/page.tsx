import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ChevronRight,
  Clock,
  RefreshCw,
  Check,
} from "lucide-react";
import { formatCents, timeAgo, getInitials } from "@/lib/utils";
import { Suspense } from "react";
import { OrderButton } from "./order-button";

export const dynamic = "force-dynamic";

interface PricingTier {
  name: string;
  price_cents: number;
  description: string;
  delivery_days: number;
  revisions: number;
  features: string[];
}

export default async function GigDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch gig with seller + category
  const { data: gig, error } = await supabase
    .from("gigs")
    .select(
      "*, users(id, full_name, username, avatar_url, seller_level, created_at), categories(name, slug)"
    )
    .eq("id", params.id)
    .single();

  if (error || !gig) notFound();

  // Fetch gig images
  const { data: images } = await supabase
    .from("gig_images")
    .select("*")
    .eq("gig_id", gig.id)
    .order("display_order");

  // Fetch reviews for this gig
  const { data: reviews } = await supabase
    .from("gig_reviews")
    .select("*, users:reviewer_id(full_name, username, avatar_url)")
    .eq("gig_id", gig.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Build pricing tiers
  const tiers: PricingTier[] = [];
  if (gig.price_basic_cents) {
    tiers.push({
      name: gig.price_basic_name || "Basic",
      price_cents: gig.price_basic_cents,
      description: gig.price_basic_description || "",
      delivery_days: gig.price_basic_delivery_days || 7,
      revisions: gig.price_basic_revisions || 1,
      features: Array.isArray(gig.features_basic) ? gig.features_basic : [],
    });
  }
  if (gig.price_standard_cents) {
    tiers.push({
      name: gig.price_standard_name || "Standard",
      price_cents: gig.price_standard_cents,
      description: gig.price_standard_description || "",
      delivery_days: gig.price_standard_delivery_days || 5,
      revisions: gig.price_standard_revisions || 3,
      features: Array.isArray(gig.features_standard) ? gig.features_standard : [],
    });
  }
  if (gig.price_premium_cents) {
    tiers.push({
      name: gig.price_premium_name || "Premium",
      price_cents: gig.price_premium_cents,
      description: gig.price_premium_description || "",
      delivery_days: gig.price_premium_delivery_days || 3,
      revisions: gig.price_premium_revisions || -1,
      features: Array.isArray(gig.features_premium) ? gig.features_premium : [],
    });
  }

  const displayImage =
    gig.thumbnail_url ||
    (images && images.length > 0 ? images[0].image_url : null);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {gig.categories?.slug && (
          <>
            <Link
              href={`/categories/${gig.categories.slug}`}
              className="hover:text-[var(--foreground)] transition-colors"
            >
              {gig.categories.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-[var(--foreground)] font-medium truncate max-w-xs">
          {gig.title}
        </span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left: gig details (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] leading-tight">
            {gig.title}
          </h1>

          {/* Seller info bar */}
          <div className="flex items-center gap-3">
            {gig.users?.avatar_url ? (
              <img
                src={gig.users.avatar_url}
                alt={gig.users.username || gig.users.full_name || "Seller"}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--cta)] flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {getInitials(gig.users?.full_name || gig.users?.username || "S")}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {gig.users?.username || gig.users?.full_name || "Seller"}
              </p>
              {gig.users?.seller_level && (
                <p className="text-xs text-[var(--warm)]">{gig.users.seller_level}</p>
              )}
            </div>
            {gig.average_rating > 0 && (
              <div className="ml-auto flex items-center gap-1">
                <Star className="w-4 h-4 text-[var(--star)] fill-[var(--star)]" />
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {Number(gig.average_rating).toFixed(1)}
                </span>
                <span className="text-sm text-[var(--foreground-hint)]">
                  ({gig.review_count})
                </span>
              </div>
            )}
          </div>

          {/* Gallery */}
          <div className="aspect-video rounded-xl overflow-hidden border border-[var(--border)]">
            {displayImage ? (
              <img
                src={displayImage}
                alt={gig.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[var(--background-secondary)] flex items-center justify-center">
                <span className="text-4xl font-black text-[var(--foreground-hint)] select-none opacity-30">
                  {gig.title.slice(0, 3).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Extra images */}
          {images && images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="w-24 h-16 rounded-lg overflow-hidden border border-[var(--border)] flex-shrink-0"
                >
                  <img
                    src={img.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              About This Gig
            </h2>
            <div className="text-[var(--foreground-muted)] leading-relaxed whitespace-pre-wrap text-sm">
              {gig.description}
            </div>
          </div>

          {/* Tags */}
          {gig.search_tags && gig.search_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {gig.search_tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--cta)] hover:text-[var(--cta)] transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              Reviews
              {gig.average_rating > 0 && (
                <span className="flex items-center gap-1 text-sm font-normal text-[var(--foreground-muted)]">
                  <Star className="w-4 h-4 fill-[var(--star)] text-[var(--star)]" />
                  {Number(gig.average_rating).toFixed(1)} ({gig.review_count})
                </span>
              )}
            </h2>

            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[var(--background-secondary)] border border-[var(--border)] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[var(--foreground)]">
                            {getInitials(
                              review.users?.full_name ||
                                review.users?.username ||
                                "A"
                            )}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--foreground)]">
                            {review.users?.username ||
                              review.users?.full_name ||
                              "Anonymous"}
                          </p>
                          <p className="text-xs text-[var(--foreground-hint)]">
                            {timeAgo(review.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating
                                ? "fill-[var(--star)] text-[var(--star)]"
                                : "text-[var(--border)]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-[var(--foreground-muted)] mt-2">
                        {review.comment}
                      </p>
                    )}
                    {review.seller_response && (
                      <div className="mt-3 pl-4 border-l-2 border-[var(--border)]">
                        <p className="text-xs font-semibold text-[var(--foreground)] mb-1">
                          Seller Response
                        </p>
                        <p className="text-sm text-[var(--foreground-muted)]">
                          {review.seller_response}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--foreground-muted)] text-sm">
                No reviews yet.
              </p>
            )}
          </div>
        </div>

        {/* Right sidebar: pricing tiers */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Pricing tiers card */}
            {tiers.length > 0 ? (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
                {tiers.map((tier, idx) => (
                  <div
                    key={tier.name}
                    className={`p-5 ${idx > 0 ? "border-t border-[var(--border)]" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-[var(--foreground)]">
                        {tier.name}
                      </h3>
                      <span className="text-lg font-bold text-[var(--foreground)]">
                        {formatCents(tier.price_cents)}
                      </span>
                    </div>
                    {tier.description && (
                      <p className="text-xs text-[var(--foreground-muted)] mb-3">
                        {tier.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)] mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {tier.delivery_days} day{tier.delivery_days !== 1 ? "s" : ""} delivery
                      </span>
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5" />
                        {tier.revisions === -1 ? "Unlimited" : tier.revisions} revision{tier.revisions !== 1 && tier.revisions !== -1 ? "s" : ""}
                      </span>
                    </div>
                    {tier.features.length > 0 && (
                      <ul className="space-y-1.5 mb-3">
                        {tier.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--foreground-muted)]">
                            <Check className="w-3.5 h-3.5 text-[var(--cta)] flex-shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <OrderButton
                      gigId={gig.id}
                      tierName={tier.name.toLowerCase()}
                      priceCents={tier.price_cents}
                      isLoggedIn={!!user}
                      isSeller={user?.id === gig.seller_id}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center">
                <p className="text-lg font-bold text-[var(--foreground)] mb-1">
                  {gig.price_basic_cents ? formatCents(gig.price_basic_cents) : "Contact seller"}
                </p>
                <OrderButton
                  gigId={gig.id}
                  tierName="basic"
                  priceCents={gig.price_basic_cents || 0}
                  isLoggedIn={!!user}
                  isSeller={user?.id === gig.seller_id}
                />
              </div>
            )}

            {/* Seller card */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                {gig.users?.avatar_url ? (
                  <img
                    src={gig.users.avatar_url}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[var(--cta)] flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {getInitials(gig.users?.full_name || gig.users?.username || "S")}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-[var(--foreground)]">
                    {gig.users?.username || gig.users?.full_name || "Seller"}
                  </p>
                  {gig.users?.seller_level && (
                    <p className="text-xs text-[var(--warm)]">{gig.users.seller_level}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {gig.average_rating > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--foreground-muted)]">Rating</span>
                    <span className="flex items-center gap-1 text-[var(--foreground)]">
                      <Star className="w-3.5 h-3.5 fill-[var(--star)] text-[var(--star)]" />
                      {Number(gig.average_rating).toFixed(1)}
                    </span>
                  </div>
                )}
                {gig.orders_completed > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--foreground-muted)]">Orders completed</span>
                    <span className="text-[var(--foreground)]">{gig.orders_completed}</span>
                  </div>
                )}
                {gig.users?.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--foreground-muted)]">Member since</span>
                    <span className="text-[var(--foreground)]">
                      {new Date(gig.users.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
