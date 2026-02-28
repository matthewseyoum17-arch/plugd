"use client";

import { useState, useEffect } from "react";
import { getPublicProfile } from "@/app/actions-profile";
import { X, MapPin, Linkedin, Globe, Star, Briefcase, Calendar, MessageSquare } from "lucide-react";
import Link from "next/link";

type Props = {
  userId: string;
  onClose: () => void;
  messageLinkPrefix: string; // e.g. "/dashboard/founder/messages" or "/dashboard/setter/messages"
};

export default function ProfileDrawer({ userId, onClose, messageLinkPrefix }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof getPublicProfile>> | null>(null);

  useEffect(() => {
    const load = async () => {
      const result = await getPublicProfile(userId);
      setData(result);
      setLoading(false);
    };
    load();
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#0f0f11] border-l border-[#1a1a1a] overflow-y-auto">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors z-10">
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading profile...</div>
          </div>
        ) : data?.error ? (
          <div className="p-6 text-gray-400">Could not load profile.</div>
        ) : (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ffffff]/20 to-[#a1a1aa]/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-white">
                  {(data?.user?.full_name || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{data?.user?.full_name}</h2>
                {data?.profile?.company_name && (
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> {data.profile.company_name}
                  </p>
                )}
                <p className="text-gray-500 text-xs capitalize">{data?.user?.role}</p>
              </div>
            </div>

            {/* Rating */}
            {data?.reviewCount && data.reviewCount > 0 ? (
              <div className="flex items-center gap-2 mb-6 p-3 bg-[#111] border border-[#1a1a1a] rounded-xl">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-white font-semibold">{data.avgRating}</span>
                <span className="text-gray-500 text-sm">({data.reviewCount} review{data.reviewCount !== 1 ? "s" : ""})</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-6 p-3 bg-[#111] border border-[#1a1a1a] rounded-xl">
                <Star className="w-5 h-5 text-gray-600" />
                <span className="text-gray-500 text-sm">No reviews yet</span>
              </div>
            )}

            {/* Profile Fields */}
            {data?.profile?.headline && (
              <p className="text-gray-300 text-sm mb-4">{data.profile.headline}</p>
            )}

            {data?.profile?.bio && (
              <div className="mb-6">
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">About</h3>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{data.profile.bio}</p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              {data?.profile?.location && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  {data.profile.location}
                </div>
              )}
              {data?.profile?.industries && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Briefcase className="w-4 h-4 text-gray-600" />
                  {data.profile.industries}
                </div>
              )}
              {data?.profile?.industry && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Briefcase className="w-4 h-4 text-gray-600" />
                  {data.profile.industry}
                </div>
              )}
              {data?.profile?.linkedin_url && (
                <a href={data.profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#ffffff] hover:underline">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              )}
              {data?.profile?.website && (
                <a href={data.profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#ffffff] hover:underline">
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4 text-gray-600" />
                Member since {new Date(data?.user?.created_at || "").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
            </div>

            {/* Stats */}
            {data?.stats && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(data.stats).map(([key, val]) => (
                  <div key={key} className="p-3 bg-[#111] border border-[#1a1a1a] rounded-xl text-center">
                    <p className="text-white font-semibold text-lg">{val as number}</p>
                    <p className="text-gray-500 text-xs capitalize">{(key as string).replace(/_/g, " ")}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Message button */}
            <Link
              href={`${messageLinkPrefix}?thread=${userId}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#ffffff] text-black font-semibold rounded-xl hover:brightness-90 transition-all text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Send Message
            </Link>

            {/* Reviews */}
            {data?.reviews && data.reviews.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Reviews</h3>
                <div className="space-y-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {data.reviews.map((review: any) => {
                    const reviewerName = Array.isArray(review.users)
                      ? review.users[0]?.full_name
                      : review.users?.full_name;
                    return (
                      <div key={review.id || review.created_at} className="p-4 bg-[#111] border border-[#1a1a1a] rounded-xl">
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-700"}`} />
                          ))}
                          <span className="text-gray-600 text-xs ml-2">
                            {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        {review.comment && <p className="text-gray-300 text-sm">{review.comment}</p>}
                        <p className="text-gray-500 text-xs mt-1">
                          by {reviewerName || "Anonymous"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
