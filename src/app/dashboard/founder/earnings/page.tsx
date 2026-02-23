import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Earnings() {
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

  const { data: payouts } = await supabase
    .from("payouts")
    .select("*, appointments(contact_name, listings(title))")
    .eq("founder_id", user.id)
    .order("created_at", { ascending: false });

  const totalPaid =
    payouts
      ?.filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const totalPending =
    payouts
      ?.filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const totalProcessing =
    payouts
      ?.filter((p) => p.status === "processing")
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  const stats = [
    {
      name: "Total Paid",
      value: `$${(totalPaid / 100).toFixed(2)}`,
      color: "text-primary",
    },
    {
      name: "Pending",
      value: `$${((totalPending + totalProcessing) / 100).toFixed(2)}`,
      color: "text-accent",
    },
    { name: "Transactions", value: payouts?.length || 0, color: "text-white" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-primary/10 text-primary border border-primary/20";
      case "pending":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "processing":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "failed":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-white/5 text-gray-400 border border-white/10";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">
          Earnings
        </h1>
        <p className="text-gray-400 mt-2 font-medium">
          Track your commissions and payouts to setters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-6 shadow-sm"
          >
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 font-heading">
              {stat.name}
            </p>
            <p className={`text-3xl font-bold font-sans ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-black/40 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-button font-semibold text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-button font-semibold text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-button font-semibold text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-button font-semibold text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-button font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {payouts?.map((payout) => (
              <tr
                key={payout.id}
                className="hover:bg-white/5 transition-colors group"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-500">
                  {new Date(payout.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-white">
                  {payout.appointments?.contact_name || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-300">
                  {payout.appointments?.listings?.title || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-primary">
                  ${((payout.amount || 0) / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-button ${getStatusColor(payout.status)}`}
                  >
                    {payout.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!payouts || payouts.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <p className="text-gray-400 font-medium">No payouts yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
