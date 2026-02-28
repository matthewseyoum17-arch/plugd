import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCents } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SellerEarningsPage() {
  if (!isSupabaseConfigured) redirect("/login");
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch completed orders for earnings
  const { data: completedOrders } = await supabase
    .from("orders")
    .select("total_cents, service_fee_cents, price_cents, completed_at")
    .eq("seller_id", user.id)
    .eq("status", "completed");

  const totalEarnings =
    completedOrders?.reduce((sum, o) => sum + (o.price_cents || 0), 0) || 0;

  // Pending earnings (active orders)
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("price_cents")
    .eq("seller_id", user.id)
    .in("status", ["pending", "in_progress", "delivered", "revision"]);

  const pendingEarnings =
    pendingOrders?.reduce((sum, o) => sum + (o.price_cents || 0), 0) || 0;

  // Monthly breakdown
  const monthlyMap: Record<string, number> = {};
  completedOrders?.forEach((o) => {
    if (o.completed_at) {
      const month = new Date(o.completed_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      monthlyMap[month] = (monthlyMap[month] || 0) + (o.price_cents || 0);
    }
  });

  const monthlyEntries = Object.entries(monthlyMap)
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .slice(0, 6);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
        Earnings
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <p className="text-[var(--foreground-muted)] text-sm">
            Total Earned
          </p>
          <p className="text-2xl font-bold mt-1 text-[var(--cta)]">
            {formatCents(totalEarnings)}
          </p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <p className="text-[var(--foreground-muted)] text-sm">
            Pending
          </p>
          <p className="text-2xl font-bold mt-1 text-[var(--foreground)]">
            {formatCents(pendingEarnings)}
          </p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <p className="text-[var(--foreground-muted)] text-sm">
            Completed Orders
          </p>
          <p className="text-2xl font-bold mt-1 text-[var(--foreground)]">
            {completedOrders?.length || 0}
          </p>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Monthly Breakdown
        </h2>
        {monthlyEntries.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {monthlyEntries.map(([month, cents]) => (
              <div
                key={month}
                className="py-3 flex items-center justify-between"
              >
                <span className="text-sm text-[var(--foreground)]">{month}</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {formatCents(cents)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--foreground-muted)] text-sm">
            No earnings yet. Complete orders to see your earnings breakdown.
          </p>
        )}
      </div>
    </div>
  );
}
