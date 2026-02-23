"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function ApplyButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleApply = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("setter_applications").insert({
        setter_id: user.id,
        listing_id: listingId,
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          setApplied(true);
          return;
        }
        throw error;
      }

      setApplied(true);
      router.refresh();
    } catch (error) {
      console.error("Error applying:", error);
      alert("Failed to apply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <button
        disabled
        className="block w-full py-2 text-center bg-gray-800 text-gray-400 font-medium rounded-lg cursor-not-allowed"
      >
        Applied
      </button>
    );
  }

  return (
    <button
      onClick={handleApply}
      disabled={loading}
      className="block w-full py-2 text-center bg-[#00FF94] text-black font-medium rounded-lg hover:bg-[#00cc76] transition-colors disabled:opacity-50"
    >
      {loading ? "Applying..." : "Apply to Promote"}
    </button>
  );
}
