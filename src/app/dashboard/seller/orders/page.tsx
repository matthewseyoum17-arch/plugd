import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCents, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SellerOrdersPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "*, gigs(title, thumbnail_url), users!orders_buyer_id_fkey(full_name, username)"
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    delivered: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    revision: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    disputed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
        Orders
      </h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {/* Gig thumbnail */}
              <div className="w-full sm:w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--background-secondary)]">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(order.gigs as any)?.thumbnail_url ? (
                  <img
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    src={(order.gigs as any).thumbnail_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[var(--foreground-hint)]">
                    Gig
                  </div>
                )}
              </div>

              {/* Order info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-[var(--foreground)] truncate text-sm">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(order.gigs as any)?.title || "Gig"}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
                      statusColors[order.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                  <span>#{order.order_number}</span>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <span>Buyer: {(order.users as any)?.username || (order.users as any)?.full_name || "—"}</span>
                  <span>{order.package_tier}</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {formatCents(order.total_cents || 0)}
                  </span>
                  <span>{timeAgo(order.created_at)}</span>
                </div>
              </div>

              {/* Due date */}
              {order.due_at && (
                <div className="text-xs text-[var(--foreground-muted)] flex-shrink-0">
                  Due {new Date(order.due_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--card)] border border-[var(--border)] rounded-xl">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            No orders yet
          </h3>
          <p className="text-[var(--foreground-muted)] text-sm">
            Orders from buyers will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
