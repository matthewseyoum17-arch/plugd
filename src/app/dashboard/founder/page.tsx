import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/ui/StatCard";

export default async function FounderOverview() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role;
  if (role !== "founder") {
    redirect("/dashboard/setter");
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("company_id", user.id);

  const activeListings =
    listings?.filter((l) => l.status === "active").length || 0;

  const { data: applications } = await supabase
    .from("setter_applications")
    .select("*, listings!inner(company_id)")
    .eq("listings.company_id", user.id)
    .eq("status", "approved");

  const totalSetters = new Set(applications?.map((a) => a.setter_id)).size || 0;

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("company_id", user.id)
    .in("status", ["submitted", "confirmed", "auto_approved"]);

  const pendingAppointments = appointments?.length || 0;

  const { data: payouts } = await supabase
    .from("payouts")
    .select("amount")
    .eq("founder_id", user.id)
    .eq("status", "paid");

  const totalPaidOut =
    (payouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0) / 100;

  const stats = [
    { name: "Active Products", value: activeListings },
    { name: "Active Setters", value: totalSetters },
    { name: "Pending Appts", value: pendingAppointments },
    { name: "Total Paid Out", value: `$${totalPaidOut.toFixed(2)}` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">
          Overview
        </h1>
        <p className="text-gray-400 mt-2 font-medium">
          Welcome back to Datacore. Here&apos;s what&apos;s happening with your products.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.name} label={stat.name} value={stat.value} />
        ))}
      </div>

      <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-heading font-semibold text-white mb-4">
          Recent Activity
        </h2>
        <div className="py-12 text-center border-2 border-dashed border-white/10 rounded-xl bg-white/5">
          <p className="text-gray-400 font-medium">No recent activity yet.</p>
        </div>
      </div>
    </div>
  );
}
