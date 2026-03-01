"use client";

import { useState, useTransition, useMemo } from "react";
import { applyToListing } from "@/app/actions";
import { Toast } from "@/components/ui/Toast";
import { Search } from "lucide-react";

type Listing = {
  id: string;
  title: string;
  description: string;
  ideal_customer: string | null;
  commission_per_appointment: number;
  commission_per_close: number;
  company_name: string;
  founder_profiles: { company_name: string; verified?: boolean } | null;
};

const CATEGORIES = [
  "All",
  "AI Receptionist",
  "Chatbot",
  "Lead Gen",
  "Other",
] as const;

function matchesCategory(title: string, cat: string) {
  if (cat === "All") return true;
  return title.toLowerCase().includes(cat.toLowerCase());
}

const PAGE_SIZE = 12;

export function BrowseGrid({
  listings,
  appliedIds,
}: {
  listings: Listing[];
  appliedIds: string[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [appliedSet, setAppliedSet] = useState<Set<string>>(
    new Set(appliedIds),
  );
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        (l.ideal_customer || "").toLowerCase().includes(q);
      const matchCat = matchesCategory(l.title, category);
      return matchSearch && matchCat;
    });
  }, [listings, search, category]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleApply = (listingId: string) => {
    setPendingId(listingId);
    startTransition(async () => {
      const result = await applyToListing(listingId);
      if (result.error) {
        if (result.error === "Already applied") {
          setAppliedSet((prev) => {
            const next = new Set(Array.from(prev));
            next.add(listingId);
            return next;
          });
        }
        setToast({ message: result.error, type: "error" });
      } else {
        setAppliedSet((prev) => {
          const next = new Set(Array.from(prev));
          next.add(listingId);
          return next;
        });
        setToast({ message: "Application submitted!", type: "success" });
      }
      setPendingId(null);
    });
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or ideal customers..."
            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/15 text-white placeholder:text-gray-500 backdrop-blur-md transition-all font-medium"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setVisibleCount(PAGE_SIZE);
            }}
            className={`px-4 py-2 rounded-full text-sm font-button font-semibold transition-all ${
              category === cat
                ? "bg-white text-black shadow-lg shadow-white/10"
                : "bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-16 text-center shadow-sm">
          <p className="text-gray-400 font-medium">
            No products match your search criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visible.map((listing) => {
              const isApplied = appliedSet.has(listing.id);
              const isLoading = isPending && pendingId === listing.id;

              return (
                <div
                  key={listing.id}
                  className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-6 flex flex-col hover:border-white/15 transition-all duration-300 group shadow-sm hover:shadow-[0_10px_40px_rgba(255,255,255,0.03)]"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-lg font-heading font-semibold text-white truncate group-hover:text-gray-300 transition-colors">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400 truncate">
                          {listing.founder_profiles?.company_name ||
                            listing.company_name}
                        </span>
                        {listing.founder_profiles?.verified && (
                          <span
                            className="inline-flex items-center justify-center w-4 h-4 bg-white/15 rounded-full shrink-0"
                            title="Verified"
                          >
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ideal customer */}
                  {listing.ideal_customer && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-6 font-medium leading-relaxed flex-1">
                      {listing.ideal_customer}
                    </p>
                  )}

                  {/* Commission pills */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 font-heading">
                        $/Appt
                      </p>
                      <p className="text-accent font-semibold">
                        $
                        {(
                          (listing.commission_per_appointment || 0) / 100
                        ).toFixed(0)}
                      </p>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 font-heading">
                        $/Close
                      </p>
                      <p className="text-white font-semibold">
                        $
                        {((listing.commission_per_close || 0) / 100).toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto pt-5 border-t border-white/5">
                    {isApplied ? (
                      <div className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-center text-gray-400 text-sm font-button font-medium flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Applied
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(listing.id)}
                        disabled={isLoading}
                        className="w-full py-3 bg-white text-black text-sm font-button font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-lg"
                      >
                        {isLoading ? "Applying..." : "Apply to Promote"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="text-center mt-10">
              <button
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="px-8 py-3 bg-glass-bg border border-glass-border text-white text-sm font-button font-semibold rounded-xl hover:bg-white/10 transition-colors backdrop-blur-md"
              >
                Load More ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
