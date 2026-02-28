"use client";

import { useState } from "react";
import { UserCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import ProfileDrawer from "@/components/profile-drawer";

type Application = {
  id: string;
  listing_title: string;
  company_name: string;
  company_id: string;
  status: string;
  created_at: string;
};

const statusColor: Record<string, string> = {
  pending: "bg-yellow-900 text-yellow-300",
  approved: "bg-green-900 text-green-300",
  rejected: "bg-red-900 text-red-300",
  waitlisted: "bg-blue-900 text-blue-300",
  inactive: "bg-gray-800 text-gray-400",
};

function ApplicationCard({ app }: { app: Application }) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 hover:border-[#ffffff] transition-all duration-150">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-medium">{app.listing_title}</p>
            <p className="text-gray-400 text-sm">{app.company_name}</p>
            <p className="text-gray-500 text-xs mt-1">
              Applied {new Date(app.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs ${statusColor[app.status] || "bg-gray-800 text-gray-400"}`}>
            {app.status}
          </span>
        </div>
        {app.company_id && (
          <div className="flex items-center gap-2 pt-3 border-t border-[#2a2a2a]">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white border border-[#2a2a2a] rounded-lg hover:bg-white/5 transition-all"
            >
              <UserCircle className="w-3.5 h-3.5" />
              View Company
            </button>
            <Link
              href={`/dashboard/setter/messages?thread=${app.company_id}`}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#ffffff] border border-[#ffffff]/20 rounded-lg hover:bg-[#ffffff]/10 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Message
            </Link>
          </div>
        )}
      </div>

      {showProfile && app.company_id && (
        <ProfileDrawer
          userId={app.company_id}
          onClose={() => setShowProfile(false)}
          messageLinkPrefix="/dashboard/setter/messages"
        />
      )}
    </>
  );
}

export function SetterApplicationsList({ applications }: { applications: Application[] }) {
  if (!applications || applications.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 text-center">
        <p className="text-gray-400">No applications yet. Browse listings to start promoting.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <ApplicationCard key={app.id} app={app} />
      ))}
    </div>
  );
}
