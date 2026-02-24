"use client";

export const dynamic = "force-dynamic";

import MessagesPageClient from "@/components/messages-page";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MessagesInner() {
  const params = useSearchParams();
  const threadWith = params.get("thread") || undefined;
  return <MessagesPageClient initialThreadWith={threadWith} />;
}

export default function SetterMessagesPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 py-20 text-center">Loading...</div>}>
      <MessagesInner />
    </Suspense>
  );
}
