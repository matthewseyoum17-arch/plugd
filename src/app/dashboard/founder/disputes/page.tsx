import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DisputeList } from "./_components/DisputeList";

export default async function DisputesPage() {
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

  const { data: disputed } = await supabase
    .from("appointments")
    .select(
      "*, listings(id, title, commission_per_appointment, commission_per_close), setter_profiles(setter_id, users!setter_profiles_setter_id_fkey(full_name))",
    )
    .eq("company_id", user.id)
    .eq("status", "disputed")
    .order("submitted_at", { ascending: false });

  const { data: resolved } = await supabase
    .from("appointments")
    .select(
      "*, listings(id, title, commission_per_appointment, commission_per_close), setter_profiles(setter_id, users!setter_profiles_setter_id_fkey(full_name))",
    )
    .eq("company_id", user.id)
    .not("dispute_resolved_at", "is", null)
    .order("dispute_resolved_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">
          Disputes
        </h1>
        <p className="text-gray-400 mt-2 font-medium">
          Review and resolve disputed appointments.
        </p>
      </div>
      <DisputeList
        disputed={disputed || []}
        resolved={resolved || []}
      />
    </div>
  );
}
