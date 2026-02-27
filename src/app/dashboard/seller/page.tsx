import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCents } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SellerOverview() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch seller's gigs
  const { data: gigs } = await supabase
    .from("gigs")
    .select("id, status, orders_completed, average_rating, review_count")
    .eq("seller_id", user.id);

  const activeGigs = gigs?.filter((g) => g.status === "active").length || 0;
  const totalOrders =
    gigs?.reduce((sum, g) => sum + (g.orders_completed || 0), 0) || 0;

  // Fetch orders
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_cents, created_at")
    .eq("seller_id", user.id);

  const activeOrders =
    orders?.filter((o) =>
      ["pending", "in_progress", "delivered", "revision"].includes(o.status)
    ).length || 0;

  const completedRevenue =
    orders
      ?.filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + (o.total_cents || 0), 0) || 0;

  const stats = [
    { name: "Active Gigs", value: activeGigs },
    { name: "Active Orders", value: activeOrders },
    { name: "Completed Orders", value: totalOrders },
    { name: "Total Earnings", value: formatCents(completedRevenue) },
  ];

  // Recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, total_cents, created_at, gigs(title), users!orders_buyer_id_fkey(full_name, username)"
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
        Seller Dashboard
      </h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
          >
            <p className="text-[var(--foreground-muted)] text-sm">{stat.name}</p>
            <p className="text-2xl font-bold mt-1 text-[var(--cta)]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Recent Orders
          </h2>
          <Link
            href="/dashboard/seller/orders"
            className="text-sm text-[var(--cta)] hover:underline"
          >
            View all
          </Link>
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {recentOrders.map((order) => {
              const statusColors: Record<string, string> = {
                pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                delivered: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
                revision: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
                completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
              };
              return (
                <div
                  key={order.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-[var(--foreground)]">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <span className="text-[var(--foreground-muted)]">{(order.users as any)?.username || (order.users as any)?.full_name || "Buyer"}</span>{" "}
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      ordered <span className="font-medium">{(order.gigs as any)?.title || "gig"}</span>
                    </p>
                    <p className="text-xs text-[var(--foreground-hint)] mt-0.5">
                      {order.order_number} &middot;{" "}
                      {formatCents(order.total_cents || 0)}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      statusColors[order.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[var(--foreground-muted)] text-sm">
            No orders yet.{" "}
            <Link
              href="/dashboard/seller/gigs/new"
              className="text-[var(--cta)] hover:underline"
            >
              Create your first gig
            </Link>{" "}
            to start receiving orders.
          </p>
        )}
      </div>
    </div>
  );
}
