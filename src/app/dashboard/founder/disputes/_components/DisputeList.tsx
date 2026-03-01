"use client";

import { Tabs } from "@/components/ui/Tabs";
import { DisputeCard } from "./DisputeCard";

type Appointment = {
  id: string;
  status: string;
  setter_id: string;
  contact_name: string;
  contact_email: string;
  contact_company: string;
  appointment_type: string;
  submitted_at: string;
  dispute_reason: string | null;
  dispute_resolution: string | null;
  dispute_resolved_at: string | null;
  listings: {
    id: string;
    title: string;
    commission_per_appointment: number;
    commission_per_close: number;
  } | null;
  setter_profiles: {
    setter_id: string;
    users: { full_name: string } | null;
  } | null;
};

export function DisputeList({
  disputed,
  resolved,
}: {
  disputed: Appointment[];
  resolved: Appointment[];
}) {
  const renderList = (list: Appointment[], showActions: boolean) => {
    if (list.length === 0) {
      return (
        <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-16 text-center shadow-sm">
          <p className="text-gray-400 font-medium">
            No disputes in this category.
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {list.map((apt) => (
          <DisputeCard
            key={apt.id}
            id={apt.id}
            status={apt.status}
            setterName={apt.setter_profiles?.users?.full_name || "Setter"}
            listingTitle={apt.listings?.title || "N/A"}
            contactName={apt.contact_name}
            contactEmail={apt.contact_email}
            contactCompany={apt.contact_company}
            appointmentType={apt.appointment_type}
            submittedAt={apt.submitted_at}
            disputeReason={apt.dispute_reason}
            disputeResolution={apt.dispute_resolution}
            disputeResolvedAt={apt.dispute_resolved_at}
            showActions={showActions}
          />
        ))}
      </div>
    );
  };

  return (
    <Tabs tabs={["Active Disputes", "Resolved"]}>
      {(tab) => {
        if (tab === "Active Disputes") return renderList(disputed, true);
        return renderList(resolved, false);
      }}
    </Tabs>
  );
}
