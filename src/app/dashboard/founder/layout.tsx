"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { User } from "@supabase/supabase-js";

const founderLinks = [
  { href: "/dashboard/founder", label: "Overview" },
  { href: "/dashboard/founder/listings", label: "My Products" },
  { href: "/dashboard/founder/applications", label: "Setter Applications" },
  { href: "/dashboard/founder/appointments", label: "Appointments" },
  { href: "/dashboard/founder/earnings", label: "Earnings & Payouts" },
];

export default function FounderLayout({
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
        if (role !== "founder") {
          router.push("/dashboard/setter");
        }
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-t-2 border-primary animate-spin mb-4" />
          Loading Datacore...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      <Sidebar links={founderLinks} title="Datacore Founder" />

      <main className="flex-1 ml-64 p-8 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-glass-bg/20 via-black to-black relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">{children}</div>
      </main>
    </div>
  );
}
