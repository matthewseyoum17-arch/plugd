"use client";
import { useTransition } from "react";
import { confirmAppointment, disputeAppointment } from "@/app/actions";
import { useRouter } from "next/navigation";

type Props = {
  appointmentId: string;
  currentStatus: string;
  setterId: string;
  commissionPerAppointment: number;
  commissionPerClose: number;
  appointmentType: string;
};

export function AppointmentActions({ appointmentId, currentStatus, setterId, commissionPerAppointment, commissionPerClose, appointmentType }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (currentStatus !== "submitted" && currentStatus !== "disputed") return null;

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await confirmAppointment(appointmentId, setterId, commissionPerAppointment, commissionPerClose, appointmentType);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  const handleDispute = () => {
    startTransition(async () => {
      const result = await disputeAppointment(appointmentId);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  return (
    <div className="flex gap-2">
      <button onClick={handleConfirm} disabled={isPending}
        className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded-lg hover:bg-green-900/50 text-xs font-medium disabled:opacity-50">
        Confirm
      </button>
      {currentStatus === "submitted" && (
        <button onClick={handleDispute} disabled={isPending}
          className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-800 rounded-lg hover:bg-red-900/50 text-xs font-medium disabled:opacity-50">
          Dispute
        </button>
      )}
    </div>
  );
}
