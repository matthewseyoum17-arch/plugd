"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";

export type GigCardData = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  price_basic_cents: number;
  average_rating: number;
  review_count: number;
  seller_id: string;
  seller_username: string;
  seller_avatar: string | null;
  seller_level: string;
  category_name: string | null;
};

export function GigCard({ gig }: { gig: GigCardData }) {
  const priceDisplay = `$${(gig.price_basic_cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

  return (
    <Link href={`/gig/${gig.id}`} className="group block">
      <div
        className="rounded-xl overflow-hidden border border-[var(--border)]
          hover:shadow-md hover:border-[var(--foreground-hint)]
          transition-all duration-200"
      >
        {/* Image area */}
        <div className="aspect-video relative overflow-hidden">
          {gig.thumbnail_url ? (
            <img
              src={gig.thumbnail_url}
              alt={gig.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}

          {/* Heart icon overlay */}
          <button
            type="button"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm
              flex items-center justify-center hover:bg-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            aria-label="Save to favorites"
          >
            <Heart className="w-4 h-4 text-gray-600" />
          </button>

          {/* Category badge */}
          {gig.category_name && (
            <div className="absolute bottom-2 left-2">
              <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                {gig.category_name}
              </span>
            </div>
          )}
        </div>

        {/* Content below image */}
        <div className="p-3">
          {/* Seller row */}
          <div className="flex items-center gap-2 mb-2">
            {gig.seller_avatar ? (
              <img
                src={gig.seller_avatar}
                alt={gig.seller_username}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-[var(--cta)] flex items-center justify-center flex-shrink-0"
              >
                <span className="text-xs font-semibold text-white">
                  {gig.seller_username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm text-[var(--foreground)] truncate">
              {gig.seller_username}
            </span>
            {gig.seller_level && (
              <span className="text-xs font-medium text-[var(--warm)] flex-shrink-0">
                {gig.seller_level}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-medium text-[var(--foreground)] line-clamp-2 mb-2 text-sm leading-snug">
            {gig.title}
          </h3>

          {/* Bottom row: rating + price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[var(--star)] fill-[var(--star)]" />
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {gig.average_rating.toFixed(1)}
              </span>
              <span className="text-sm text-[var(--foreground-hint)]">
                ({gig.review_count})
              </span>
            </div>
            <div className="text-sm text-[var(--foreground)]">
              From{" "}
              <span className="font-bold">{priceDisplay}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function GigCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)]">
      {/* Image placeholder */}
      <div className="aspect-video bg-gray-200 animate-pulse" />

      <div className="p-3">
        {/* Seller row skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Title skeleton - two lines */}
        <div className="space-y-1.5 mb-2">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Bottom row skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
