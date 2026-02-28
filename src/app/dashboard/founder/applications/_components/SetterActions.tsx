"use client";

import { useState } from "react";
import { MessageSquare, UserCircle } from "lucide-react";
import Link from "next/link";
import ProfileDrawer from "@/components/profile-drawer";

export function SetterActions({ setterId, setterName }: { setterId: string; setterName: string }) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white border border-[#1a1a1a] rounded-lg hover:bg-white/5 transition-all"
          title={`View ${setterName}'s profile`}
        >
          <UserCircle className="w-3.5 h-3.5" />
          Profile
        </button>
        <Link
          href={`/dashboard/founder/messages?thread=${setterId}`}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#ffffff] border border-[#ffffff]/20 rounded-lg hover:bg-[#ffffff]/10 transition-all"
          title={`Message ${setterName}`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Message
        </Link>
      </div>

      {showProfile && (
        <ProfileDrawer
          userId={setterId}
          onClose={() => setShowProfile(false)}
          messageLinkPrefix="/dashboard/founder/messages"
        />
      )}
    </>
  );
}
