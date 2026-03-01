import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WithdrawalPanel } from "./_components/WithdrawalPanel";

export default async function WithdrawalsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role;
  if (role !== "setter") {
    redirect("/dashboard/founder");
  }

  // Get pending payouts (available balance)
  const { data: payouts } = await supabase
    .from("payouts")
    .select("amount")
    .eq("setter_id", user.id)
    .eq("status", "pending");

  const totalPending =
    payouts?.reduce((s, p) => s + (p.amount || 0), 0) || 0;

  // Get existing withdrawal requests
  const { data: withdrawals } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("setter_id", user.id)
    .order("created_at", { ascending: false });

  const pendingWithdrawals =
    withdrawals
      ?.filter((w) => w.status === "pending" || w.status === "processing")
      .reduce((s, w) => s + (w.amount || 0), 0) || 0;

  const availableBalance = totalPending - pendingWithdrawals;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">
          Withdrawals
        </h1>
        <p className="text-gray-400 mt-2 font-medium">
          Request payouts from your available balance.
        </p>
      </div>
      <WithdrawalPanel
        availableBalance={availableBalance}
        withdrawals={withdrawals || []}
      />
    </div>
  );
}
