"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { User } from "@supabase/supabase-js";

const setterLinks = [
  { href: "/dashboard/setter", label: "Overview" },
  { href: "/dashboard/setter/browse", label: "Browse" },
  { href: "/dashboard/setter/products", label: "My Products" },
  { href: "/dashboard/setter/appointments", label: "Appointments" },
  { href: "/dashboard/setter/earnings", label: "Earnings" },
];

export default function SetterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login");
      } else {
        const role = session.user.user_metadata?.role;
        if (role !== "setter") {
          router.push("/dashboard/founder");
        }
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white font-sans">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-t-2 border-neon animate-spin mb-4" />
          <span className="text-gray-400">Loading Plugd...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background text-white font-sans">
      <Sidebar links={setterLinks} title="Plugd Setter" />

      <main className="flex-1 ml-64 p-8 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.03)_0%,transparent_50%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">{children}</div>
      </main>
    </div>
  );
}
