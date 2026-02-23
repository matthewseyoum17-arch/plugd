import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: stale } = await supabase
    .from("appointments")
    .select("id, setter_id, company_id, listing_id, appointment_type, listings(commission_per_appointment, commission_per_close)")
    .eq("status", "submitted")
    .lt("submitted_at", cutoff);

  if (!stale?.length) return new Response("No stale appointments");

  for (const appt of stale) {
    await supabase.from("appointments").update({ status: "auto_approved" }).eq("id", appt.id);

    const base = appt.appointment_type === "close"
      ? appt.listings.commission_per_close
      : appt.listings.commission_per_appointment;
    const fee = appt.appointment_type === "close" ? 0.05 : 0.07;
    const amount = Math.round(base * (1 - fee));

    await supabase.from("payouts").insert({
      founder_id: appt.company_id,
      setter_id: appt.setter_id,
      appointment_id: appt.id,
      amount,
      status: "pending",
    });
  }

  return new Response(`Auto-approved ${stale.length} appointments`);
});
