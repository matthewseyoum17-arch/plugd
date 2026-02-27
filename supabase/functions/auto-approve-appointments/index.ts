import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYOUT_CLEARING_DAYS = 14;

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

  let approved = 0;

  for (const appt of stale) {
    // Check for locked commission from setter application
    const { data: app } = await supabase
      .from("setter_applications")
      .select("locked_commission_per_appointment, locked_commission_per_close")
      .eq("setter_id", appt.setter_id)
      .eq("listing_id", appt.listing_id)
      .single();

    const grossCommission = appt.appointment_type === "close"
      ? (app?.locked_commission_per_close ?? appt.listings.commission_per_close)
      : (app?.locked_commission_per_appointment ?? appt.listings.commission_per_appointment);

    const feeRate = appt.appointment_type === "close" ? 0.05 : 0.07;
    const platformFee = Math.round(grossCommission * feeRate);
    const netAmount = grossCommission - platformFee;

    // Deduct from founder wallet if it exists
    const { data: wallet } = await supabase
      .from("founder_wallets")
      .select("balance, total_spent")
      .eq("founder_id", appt.company_id)
      .single();

    if (wallet) {
      const newBalance = wallet.balance - grossCommission;
      await supabase
        .from("founder_wallets")
        .update({
          balance: newBalance,
          total_spent: (wallet.total_spent || 0) + grossCommission,
          updated_at: new Date().toISOString(),
        })
        .eq("founder_id", appt.company_id);

      // Record wallet transaction
      await supabase.from("wallet_transactions").insert({
        founder_id: appt.company_id,
        type: "payout_deduct",
        amount: grossCommission,
        balance_after: newBalance,
        reference_id: appt.id,
        description: `Auto-approved: $${(grossCommission / 100).toFixed(2)} deducted`,
      });
    }

    // Update appointment status
    await supabase.from("appointments").update({ status: "auto_approved" }).eq("id", appt.id);

    // Increment appointments_used and auto-pause if budget exhausted
    const { data: listing } = await supabase
      .from("listings")
      .select("appointments_used, max_appointments")
      .eq("id", appt.listing_id)
      .single();

    if (listing) {
      const newUsed = (listing.appointments_used || 0) + 1;
      const updates: Record<string, unknown> = { appointments_used: newUsed };
      if (listing.max_appointments > 0 && newUsed >= listing.max_appointments) {
        updates.status = "paused";
      }
      await supabase.from("listings").update(updates).eq("id", appt.listing_id);
    }

    // Create payout with 14-day clearing period
    const clearsAt = new Date();
    clearsAt.setDate(clearsAt.getDate() + PAYOUT_CLEARING_DAYS);

    await supabase.from("payouts").insert({
      founder_id: appt.company_id,
      setter_id: appt.setter_id,
      appointment_id: appt.id,
      amount: netAmount,
      gross_amount: grossCommission,
      platform_fee: platformFee,
      clears_at: clearsAt.toISOString(),
      status: "pending",
    });

    // Update founder dispute stats (increment total_appointments)
    const { data: profile } = await supabase
      .from("founder_profiles")
      .select("total_appointments")
      .eq("founder_id", appt.company_id)
      .single();

    if (profile) {
      await supabase
        .from("founder_profiles")
        .update({ total_appointments: (profile.total_appointments || 0) + 1 })
        .eq("founder_id", appt.company_id);
    }

    approved++;
  }

  return new Response(`Auto-approved ${approved} appointments`);
});
