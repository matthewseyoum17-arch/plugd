"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type ApplicationActionProps = {
  applicationId: string;
  currentStatus: string;
};

export function ApplicationActions({
  applicationId,
  currentStatus,
}: ApplicationActionProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  if (currentStatus !== "pending") {
    return null;
  }

  const handleApprove = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("setter_applications")
        .update({ status: "approved" })
        .eq("id", applicationId);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error("Error approving application:", error);
      alert("Failed to approve application");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("setter_applications")
        .update({ status: "rejected" })
        .eq("id", applicationId);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Failed to reject application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="px-4 py-2 bg-primary text-white border border-transparent rounded-lg hover:bg-primary-hover transition-colors text-xs font-button font-semibold disabled:opacity-50 shadow-[0_0_15px_rgba(123,57,252,0.2)]"
      >
        Approve
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        className="px-4 py-2 bg-transparent text-gray-400 border border-white/10 rounded-lg hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors text-xs font-button font-medium disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
