"use client";

import { useState } from "react";
import { submitReview } from "@/app/actions-reviews";
import { X, Star } from "lucide-react";

type Props = {
  appointmentId: string;
  revieweeId: string;
  revieweeName: string;
  onClose: () => void;
  onSubmitted: () => void;
};

export default function ReviewModal({ appointmentId, revieweeId, revieweeName, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await submitReview({
      appointmentId,
      revieweeId,
      rating,
      comment: comment || undefined,
    });
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      onSubmitted();
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-6 w-full max-w-md mx-4">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">Leave a Review</h2>
        <p className="text-gray-500 text-sm mb-6">How was your experience with {revieweeName}?</p>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-xl text-red-400 text-sm mb-4">{error}</div>
        )}

        {/* Star rating */}
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHoveredRating(s)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  s <= displayRating ? "text-yellow-500 fill-yellow-500" : "text-gray-700"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-gray-500 text-xs mb-6">
          {displayRating === 1 && "Poor"}
          {displayRating === 2 && "Fair"}
          {displayRating === 3 && "Good"}
          {displayRating === 4 && "Very Good"}
          {displayRating === 5 && "Excellent"}
        </p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)..."
          maxLength={1000}
          className="w-full px-4 py-3 bg-[#111] border border-[#1a1a1a] rounded-xl focus:outline-none focus:border-[#00FF94]/50 text-white text-sm placeholder:text-gray-600 h-24 resize-none"
        />
        <p className="text-gray-600 text-xs mt-1 mb-6">{comment.length}/1000</p>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-[#1a1a1a] rounded-xl text-gray-400 text-sm hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex-1 py-3 bg-[#00FF94] text-black font-semibold rounded-xl hover:brightness-90 disabled:opacity-50 transition-all text-sm"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
