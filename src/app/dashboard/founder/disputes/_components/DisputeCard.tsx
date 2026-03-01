"use client";

import { useState, useTransition } from "react";
import { resolveDispute } from "@/app/actions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";

type Props = {
  id: string;
  status: string;
  setterName: string;
  listingTitle: string;
  contactName: string;
  contactEmail: string;
  contactCompany: string;
  appointmentType: string;
  submittedAt: string;
  disputeReason: string | null;
  disputeResolution: string | null;
  disputeResolvedAt: string | null;
  showActions: boolean;
};

export function DisputeCard(props: Props) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [resolution, setResolution] = useState<"confirmed" | "rejected">("confirmed");
  const [notes, setNotes] = useState("");

  const handleResolve = () => {
    startTransition(async () => {
      const result = await resolveDispute(props.id, resolution, notes);
      if (result.error) {
        alert(result.error);
      } else {
        setShowModal(false);
        setNotes("");
      }
    });
  };

  return (
    <>
      <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-white font-heading font-semibold text-lg truncate">
              {props.listingTitle}
            </p>
            <p className="text-sm font-medium text-gray-400 mt-1">
              Setter: <span className="text-gray-300">{props.setterName}</span>
            </p>
          </div>
          <StatusBadge status={props.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 rounded-xl bg-black/40 border border-white/5">
          <div>
            <p className="text-gray-500 font-heading text-[10px] uppercase tracking-wider mb-1 font-semibold">
              Contact
            </p>
            <p className="text-white font-medium text-sm truncate">
              {props.contactName}
            </p>
            <p className="text-gray-400 text-xs truncate mt-0.5">
              {props.contactEmail}
            </p>
            {props.contactCompany && (
              <p className="text-gray-500 text-xs truncate mt-0.5">
                {props.contactCompany}
              </p>
            )}
          </div>
          <div>
            <p className="text-gray-500 font-heading text-[10px] uppercase tracking-wider mb-1 font-semibold">
              Type
            </p>
            <p className="text-white font-medium text-sm capitalize">
              {props.appointmentType}
            </p>
          </div>
          <div>
            <p className="text-gray-500 font-heading text-[10px] uppercase tracking-wider mb-1 font-semibold">
              Submitted
            </p>
            <p className="text-white font-medium text-sm">
              {new Date(props.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {props.disputeReason && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
            <p className="text-gray-500 font-heading text-[10px] uppercase tracking-wider mb-1 font-semibold">
              Dispute Reason
            </p>
            <p className="text-red-300 text-sm">{props.disputeReason}</p>
          </div>
        )}

        {props.disputeResolution && (
          <div className="mb-4 p-4 rounded-xl bg-green-500/5 border border-green-500/10">
            <p className="text-gray-500 font-heading text-[10px] uppercase tracking-wider mb-1 font-semibold">
              Resolution
            </p>
            <p className="text-green-300 text-sm">{props.disputeResolution}</p>
            {props.disputeResolvedAt && (
              <p className="text-gray-500 text-xs mt-1">
                Resolved {new Date(props.disputeResolvedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {props.showActions && props.status === "disputed" && (
          <div className="flex justify-end pt-4 border-t border-glass-border">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-accent text-white text-xs font-button font-semibold rounded-lg hover:bg-accent/80 transition-all"
            >
              Resolve Dispute
            </button>
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Resolve Dispute"
      >
        <div className="space-y-5">
          <div>
            <p className="text-sm text-gray-400 mb-3">
              Choose how to resolve the dispute for <span className="text-white font-medium">{props.contactName}</span> on <span className="text-white font-medium">{props.listingTitle}</span>.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setResolution("confirmed")}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-button font-semibold border transition-all ${
                resolution === "confirmed"
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : "bg-black/40 text-gray-400 border-white/10 hover:border-white/20"
              }`}
            >
              Confirm &amp; Pay
            </button>
            <button
              onClick={() => setResolution("rejected")}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-button font-semibold border transition-all ${
                resolution === "rejected"
                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                  : "bg-black/40 text-gray-400 border-white/10 hover:border-white/20"
              }`}
            >
              Reject
            </button>
          </div>

          <div>
            <label className="block text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Resolution Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes about your decision..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/50 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2.5 bg-transparent text-gray-400 border border-white/10 text-sm font-button font-medium rounded-lg hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleResolve}
              disabled={isPending}
              className={`flex-1 px-4 py-2.5 text-sm font-button font-semibold rounded-lg transition-all disabled:opacity-50 ${
                resolution === "confirmed"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {isPending
                ? "Processing..."
                : resolution === "confirmed"
                  ? "Confirm & Create Payout"
                  : "Reject Appointment"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
