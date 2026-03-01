"use client";

import { useState } from "react";
import { requestWithdrawal } from "@/app/actions";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Withdrawal = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
};

export function WithdrawalPanel({
  availableBalance,
  withdrawals,
}: {
  availableBalance: number;
  withdrawals: Withdrawal[];
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const result = await requestWithdrawal(parseFloat(amount));
      if ("error" in result) {
        setMessage(result.error as string);
      } else {
        setMessage("Withdrawal requested!");
        setAmount("");
      }
    } catch {
      setMessage("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Request form */}
      <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Available Balance</h2>
        <p className="text-3xl font-bold text-white mb-6">${availableBalance.toFixed(2)}</p>
        <form onSubmit={handleWithdraw} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">Amount ($)</label>
            <input
              type="number"
              min="10"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/25"
              placeholder="Min $10.00"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-neon px-6 py-3 text-sm disabled:opacity-50"
          >
            {loading ? "Requesting..." : "Withdraw"}
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-gray-400">{message}</p>}
      </div>

      {/* History */}
      <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Withdrawal History</h2>
        {withdrawals.length === 0 ? (
          <p className="text-gray-500 text-sm">No withdrawals yet.</p>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white font-medium">${w.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{new Date(w.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={w.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
