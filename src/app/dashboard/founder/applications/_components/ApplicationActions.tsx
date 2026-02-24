"use client";
import { useTransition } from "react";
import { updateApplicationStatus } from "@/app/actions";
import { useRouter } from "next/navigation";

export function ApplicationActions({ applicationId, currentStatus }: { applicationId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (currentStatus !== "pending") return null;

  const handle = (status: "approved" | "rejected") => {
    startTransition(async () => {
      await updateApplicationStatus(applicationId, status);
      router.refresh();
    });
  };

  return (
    <div className="flex gap-2">
      <button onClick={() => handle("approved")} disabled={isPending}
        className="px-4 py-2 bg-green-900/30 text-green-400 border border-green-800 rounded-lg hover:bg-green-900/50 text-xs font-semibold disabled:opacity-50">
        Approve
      </button>
      <button onClick={() => handle("rejected")} disabled={isPending}
        className="px-4 py-2 bg-red-900/30 text-red-400 border border-red-800 rounded-lg hover:bg-red-900/50 text-xs font-medium disabled:opacity-50">
        Reject
      </button>
    </div>
  );
}
