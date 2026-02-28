"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Validation helpers ─────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ─── Constants ──────────────────────────────────────────────────────

const FEE_RATE_APPOINTMENT = 0.07; // 7% platform fee on appointments
const FEE_RATE_CLOSE = 0.05;       // 5% platform fee on closes
const PAYOUT_CLEARING_DAYS = 14;   // 14-day clearing period
const MIN_WITHDRAWAL_CENTS = 5000; // $50 minimum withdrawal
const DISPUTE_FLAG_THRESHOLD = 0.3; // Flag founders with >30% dispute rate

// ─── Listings ────────────────────────────────────────────────────────

export async function toggleListingStatus(listingId: string, newStatus: "active" | "paused") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (newStatus !== "active" && newStatus !== "paused") {
    return { error: "Invalid status" };
  }

  const { error } = await supabase
    .from("listings")
    .update({ status: newStatus })
    .eq("id", listingId)
    .eq("company_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/founder/listings");
  return { success: true };
}

// ─── Wallet / Escrow ────────────────────────────────────────────────

export async function getWalletBalance() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: wallet } = await supabase
    .from("founder_wallets")
    .select("*")
    .eq("founder_id", user.id)
    .single();

  if (!wallet) {
    return { balance: 0, total_deposited: 0, total_spent: 0 };
  }
  return {
    balance: wallet.balance,
    total_deposited: wallet.total_deposited,
    total_spent: wallet.total_spent,
  };
}

export async function depositToWallet(amountCents: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!amountCents || amountCents < 100) return { error: "Minimum deposit is $1.00" };
  if (amountCents > 10000000) return { error: "Maximum deposit is $100,000" };

  // Upsert wallet
  const { data: existing } = await supabase
    .from("founder_wallets")
    .select("balance, total_deposited")
    .eq("founder_id", user.id)
    .single();

  const currentBalance = existing?.balance || 0;
  const currentDeposited = existing?.total_deposited || 0;
  const newBalance = currentBalance + amountCents;

  if (existing) {
    const { error } = await supabase
      .from("founder_wallets")
      .update({
        balance: newBalance,
        total_deposited: currentDeposited + amountCents,
        updated_at: new Date().toISOString(),
      })
      .eq("founder_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("founder_wallets")
      .insert({
        founder_id: user.id,
        balance: amountCents,
        total_deposited: amountCents,
        total_spent: 0,
      });
    if (error) return { error: error.message };
  }

  // Record transaction
  await supabase.from("wallet_transactions").insert({
    founder_id: user.id,
    type: "deposit",
    amount: amountCents,
    balance_after: newBalance,
    description: `Deposited $${(amountCents / 100).toFixed(2)}`,
  });

  revalidatePath("/dashboard/founder/earnings");
  return { success: true, balance: newBalance };
}

export async function withdrawFromWallet(amountCents: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!amountCents || amountCents < 100) return { error: "Minimum withdrawal is $1.00" };

  const { data: wallet } = await supabase
    .from("founder_wallets")
    .select("balance")
    .eq("founder_id", user.id)
    .single();

  if (!wallet || wallet.balance < amountCents) {
    return { error: "Insufficient balance" };
  }

  const newBalance = wallet.balance - amountCents;

  const { error } = await supabase
    .from("founder_wallets")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("founder_id", user.id);
  if (error) return { error: error.message };

  await supabase.from("wallet_transactions").insert({
    founder_id: user.id,
    type: "withdrawal",
    amount: amountCents,
    balance_after: newBalance,
    description: `Withdrew $${(amountCents / 100).toFixed(2)}`,
  });

  revalidatePath("/dashboard/founder/earnings");
  return { success: true, balance: newBalance };
}

// ─── Applications ────────────────────────────────────────────────────

export async function applyToListing(listingId: string, sampleEmail: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!listingId) return { error: "Listing ID required" };
  if (!sampleEmail?.trim()) return { error: "Sample email is required" };
  if (sampleEmail.length > 5000) return { error: "Sample email is too long" };

  // Verify listing is active
  const { data: listing } = await supabase
    .from("listings")
    .select("id, status, max_setters")
    .eq("id", listingId)
    .eq("status", "active")
    .single();
  if (!listing) return { error: "Listing not found or no longer active" };

  const { data: existing } = await supabase
    .from("setter_applications")
    .select("id")
    .eq("setter_id", user.id)
    .eq("listing_id", listingId)
    .single();
  if (existing) return { error: "Already applied" };

  // Check if listing is at max setters — if so, waitlist
  const maxSetters = listing.max_setters || 5;
  const { count: approvedCount } = await supabase
    .from("setter_applications")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId)
    .eq("status", "approved");

  const applicationStatus = (approvedCount || 0) >= maxSetters ? "waitlisted" : "pending";

  const { error } = await supabase.from("setter_applications").insert({
    setter_id: user.id,
    listing_id: listingId,
    sample_email: sampleEmail.trim(),
    status: applicationStatus,
  });

  if (error) {
    if (error.message.includes("duplicate") || error.message.includes("unique")) {
      return { error: "Already applied" };
    }
    return { error: error.message };
  }
  revalidatePath("/dashboard/setter/browse");
  return { success: true };
}

export async function updateApplicationStatus(applicationId: string, status: "approved" | "rejected") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (status !== "approved" && status !== "rejected") {
    return { error: "Invalid status" };
  }

  // Verify founder owns the listing this application belongs to
  const { data: owned } = await supabase
    .from("setter_applications")
    .select("id, listing_id, listings!inner(company_id, commission_per_appointment, commission_per_close)")
    .eq("id", applicationId)
    .eq("listings.company_id", user.id)
    .single();
  if (!owned) return { error: "Not authorized" };

  // Lock commission rates at approval time
  const listing = owned.listings as unknown as {
    commission_per_appointment: number;
    commission_per_close: number;
  };

  const updateData: Record<string, unknown> = { status };
  if (status === "approved") {
    updateData.locked_commission_per_appointment = listing.commission_per_appointment;
    updateData.locked_commission_per_close = listing.commission_per_close;
  }

  const { error } = await supabase
    .from("setter_applications")
    .update(updateData)
    .eq("id", applicationId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/founder/applications");
  revalidatePath("/dashboard/setter/applications");
  return { success: true };
}

// ─── Appointments ────────────────────────────────────────────────────

type SubmitAppointmentInput = {
  listing_id: string;
  contact_name: string;
  contact_email: string;
  contact_company: string;
  calendly_event_url: string;
  appointment_type: "appointment" | "close";
  meeting_date?: string;
  contact_linkedin?: string;
  contact_website?: string;
  notes?: string;
};

export async function submitAppointment(input: SubmitAppointmentInput) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // ── Input validation ──
  if (!input.listing_id) return { error: "Please select a listing" };

  if (!input.contact_name?.trim()) return { error: "Contact name is required" };
  if (input.contact_name.trim().length > 100) return { error: "Contact name is too long (max 100 characters)" };

  if (!input.contact_email?.trim()) return { error: "Contact email is required" };
  if (!isValidEmail(input.contact_email.trim())) return { error: "Invalid email format" };

  if (!input.contact_company?.trim()) return { error: "Contact company is required" };
  if (input.contact_company.trim().length > 100) return { error: "Company name is too long (max 100 characters)" };

  if (!input.calendly_event_url?.trim()) return { error: "Calendly event URL is required" };
  if (!isValidUrl(input.calendly_event_url.trim())) return { error: "Invalid URL format" };

  if (input.appointment_type !== "appointment" && input.appointment_type !== "close") {
    return { error: "Invalid appointment type" };
  }

  if (input.notes && input.notes.length > 2000) return { error: "Notes are too long (max 2000 characters)" };

  // ── Verify setter has approved application for this listing ──
  const { data: application } = await supabase
    .from("setter_applications")
    .select("id")
    .eq("setter_id", user.id)
    .eq("listing_id", input.listing_id)
    .eq("status", "approved")
    .single();
  if (!application) return { error: "No approved application for this listing" };

  // ── Verify listing is still active ──
  const { data: listing } = await supabase
    .from("listings")
    .select("company_id, status, max_appointments, appointments_used, daily_setter_cap")
    .eq("id", input.listing_id)
    .single();
  if (!listing) return { error: "Listing not found" };
  if (listing.status !== "active") return { error: "This listing is paused and not accepting appointments" };

  // ── Budget check: has the founder hit their max? ──
  if (listing.max_appointments > 0 && listing.appointments_used >= listing.max_appointments) {
    return { error: "This listing has reached its appointment budget. The founder needs to increase the limit." };
  }

  // ── Daily cap check: has this setter hit the daily limit? ──
  const dailyCap = listing.daily_setter_cap || 3;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: todayCount } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("setter_id", user.id)
    .eq("listing_id", input.listing_id)
    .gte("submitted_at", todayStart.toISOString());

  if ((todayCount || 0) >= dailyCap) {
    return { error: `You've reached the daily submission limit of ${dailyCap} for this listing. Try again tomorrow.` };
  }

  // ── Wallet check: does the founder have enough funds? ──
  const { data: wallet } = await supabase
    .from("founder_wallets")
    .select("balance")
    .eq("founder_id", listing.company_id)
    .single();

  const commissionNeeded = input.appointment_type === "close"
    ? (listing as unknown as { commission_per_close?: number }).commission_per_close || 0
    : (listing as unknown as { commission_per_appointment?: number }).commission_per_appointment || 0;

  // Only block if wallet exists and is underfunded (if no wallet exists, legacy mode)
  if (wallet && wallet.balance < commissionNeeded && commissionNeeded > 0) {
    return { error: "The founder's wallet doesn't have enough funds for this appointment. Please try again later." };
  }

  const { error } = await supabase.from("appointments").insert({
    setter_id: user.id,
    listing_id: input.listing_id,
    company_id: listing.company_id,
    contact_name: input.contact_name.trim(),
    contact_email: input.contact_email.trim().toLowerCase(),
    contact_company: input.contact_company.trim(),
    calendly_event_url: input.calendly_event_url.trim(),
    appointment_type: input.appointment_type,
    meeting_date: input.meeting_date || null,
    contact_linkedin: input.contact_linkedin?.trim() || null,
    contact_website: input.contact_website?.trim() || null,
    notes: input.notes?.trim() || null,
    status: "submitted",
    submitted_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  // ── Track setter activity ──
  await supabase
    .from("setter_applications")
    .update({ last_submission_at: new Date().toISOString() })
    .eq("setter_id", user.id)
    .eq("listing_id", input.listing_id)
    .eq("status", "approved");

  revalidatePath("/dashboard/setter/appointments");
  return { success: true };
}

export async function confirmAppointment(appointmentId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // ── Prevent duplicate payouts ──
  const { data: existingPayout } = await supabase
    .from("payouts")
    .select("id")
    .eq("appointment_id", appointmentId)
    .maybeSingle();
  if (existingPayout) return { error: "This appointment has already been confirmed" };

  // Fetch appointment with listing commission data — also verifies ownership
  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("id, setter_id, listing_id, status, appointment_type, listings(commission_per_appointment, commission_per_close)")
    .eq("id", appointmentId)
    .eq("company_id", user.id)
    .single();

  if (fetchError || !appointment) return { error: "Appointment not found or not authorized" };

  if (appointment.status !== "submitted") {
    return { error: `Cannot confirm an appointment with status "${appointment.status}"` };
  }

  // Check for locked commission from setter application
  const { data: app } = await supabase
    .from("setter_applications")
    .select("locked_commission_per_appointment, locked_commission_per_close")
    .eq("setter_id", appointment.setter_id)
    .eq("listing_id", appointment.listing_id)
    .single();

  const listing = appointment.listings as unknown as {
    commission_per_appointment: number;
    commission_per_close: number;
  } | null;

  // Use locked commission if available, otherwise fallback to current listing rate
  const grossCommission = appointment.appointment_type === "close"
    ? (app?.locked_commission_per_close ?? listing?.commission_per_close ?? 0)
    : (app?.locked_commission_per_appointment ?? listing?.commission_per_appointment ?? 0);
  const feeRate = appointment.appointment_type === "close" ? FEE_RATE_CLOSE : FEE_RATE_APPOINTMENT;
  const platformFee = Math.round(grossCommission * feeRate);
  const netAmount = grossCommission - platformFee;

  // ── Deduct from founder wallet ──
  const { data: wallet } = await supabase
    .from("founder_wallets")
    .select("balance, total_spent")
    .eq("founder_id", user.id)
    .single();

  if (wallet) {
    if (wallet.balance < grossCommission) {
      return { error: `Insufficient wallet balance. You need $${(grossCommission / 100).toFixed(2)} but only have $${(wallet.balance / 100).toFixed(2)}. Please top up your wallet.` };
    }

    const newBalance = wallet.balance - grossCommission;
    await supabase
      .from("founder_wallets")
      .update({
        balance: newBalance,
        total_spent: (wallet.total_spent || 0) + grossCommission,
        updated_at: new Date().toISOString(),
      })
      .eq("founder_id", user.id);

    // Record wallet transaction
    await supabase.from("wallet_transactions").insert({
      founder_id: user.id,
      type: "payout_deduct",
      amount: grossCommission,
      balance_after: newBalance,
      reference_id: appointmentId,
      description: `Paid $${(grossCommission / 100).toFixed(2)} for confirmed appointment`,
    });
  }

  // ── Update appointment status ──
  const { error: updateError } = await supabase
    .from("appointments")
    .update({ status: "confirmed" })
    .eq("id", appointmentId)
    .eq("company_id", user.id)
    .eq("status", "submitted");

  if (updateError) return { error: updateError.message };

  // ── Increment appointments_used on listing ──
  const { data: currentListing } = await supabase
    .from("listings")
    .select("appointments_used, max_appointments")
    .eq("id", appointment.listing_id)
    .single();

  if (currentListing) {
    const newUsed = (currentListing.appointments_used || 0) + 1;
    const updates: Record<string, unknown> = { appointments_used: newUsed };

    // Auto-pause if budget exhausted
    if (currentListing.max_appointments > 0 && newUsed >= currentListing.max_appointments) {
      updates.status = "paused";
    }

    await supabase.from("listings").update(updates).eq("id", appointment.listing_id);
  }

  // ── Create payout with 14-day clearing ──
  const clearsAt = new Date();
  clearsAt.setDate(clearsAt.getDate() + PAYOUT_CLEARING_DAYS);

  const { error: payoutError } = await supabase.from("payouts").insert({
    founder_id: user.id,
    setter_id: appointment.setter_id,
    appointment_id: appointmentId,
    amount: netAmount,
    gross_amount: grossCommission,
    platform_fee: platformFee,
    clears_at: clearsAt.toISOString(),
    status: "pending",
  });

  if (payoutError) {
    if (payoutError.message.includes("duplicate") || payoutError.message.includes("unique")) {
      revalidatePath("/dashboard/founder/appointments");
      return { success: true };
    }
    return { error: payoutError.message };
  }

  // ── Update founder dispute stats ──
  const { data: founderProfile } = await supabase
    .from("founder_profiles")
    .select("total_appointments")
    .eq("founder_id", user.id)
    .single();

  if (founderProfile) {
    await supabase
      .from("founder_profiles")
      .update({ total_appointments: (founderProfile.total_appointments || 0) + 1 })
      .eq("founder_id", user.id);
  }

  revalidatePath("/dashboard/founder/appointments");
  revalidatePath("/dashboard/founder/earnings");
  return { success: true };
}

export async function disputeAppointment(appointmentId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, status")
    .eq("id", appointmentId)
    .eq("company_id", user.id)
    .single();

  if (!appointment) return { error: "Appointment not found or not authorized" };
  if (appointment.status !== "submitted") {
    return { error: `Cannot dispute an appointment with status "${appointment.status}"` };
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status: "disputed" })
    .eq("id", appointmentId)
    .eq("company_id", user.id)
    .eq("status", "submitted");

  if (error) return { error: error.message };

  // ── Update dispute stats & check flagging ──
  const { data: profile } = await supabase
    .from("founder_profiles")
    .select("total_appointments, total_disputes")
    .eq("founder_id", user.id)
    .single();

  if (profile) {
    const newDisputes = (profile.total_disputes || 0) + 1;
    const newTotal = (profile.total_appointments || 0) + 1;
    const disputeRate = newTotal > 0 ? newDisputes / newTotal : 0;

    await supabase
      .from("founder_profiles")
      .update({
        total_disputes: newDisputes,
        total_appointments: newTotal,
        flagged: disputeRate > DISPUTE_FLAG_THRESHOLD && newTotal >= 5,
      })
      .eq("founder_id", user.id);
  }

  revalidatePath("/dashboard/founder/appointments");
  return { success: true };
}

// ─── Auto-Approve Stale Appointments ────────────────────────────────

const AUTO_APPROVE_HOURS = 48;

export async function autoApproveStaleAppointments() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Find all submitted appointments for this founder older than 48 hours
  const cutoff = new Date(Date.now() - AUTO_APPROVE_HOURS * 60 * 60 * 1000).toISOString();

  const { data: staleAppointments } = await supabase
    .from("appointments")
    .select("id, setter_id, listing_id, appointment_type, listings(commission_per_appointment, commission_per_close)")
    .eq("company_id", user.id)
    .eq("status", "submitted")
    .lte("submitted_at", cutoff);

  if (!staleAppointments || staleAppointments.length === 0) {
    return { count: 0 };
  }

  let approved = 0;

  for (const apt of staleAppointments) {
    const { data: existingPayout } = await supabase
      .from("payouts")
      .select("id")
      .eq("appointment_id", apt.id)
      .maybeSingle();
    if (existingPayout) continue;

    const listing = apt.listings as unknown as {
      commission_per_appointment: number;
      commission_per_close: number;
    } | null;

    const grossCommission = apt.appointment_type === "close"
      ? (listing?.commission_per_close ?? 0)
      : (listing?.commission_per_appointment ?? 0);
    const feeRate = apt.appointment_type === "close" ? FEE_RATE_CLOSE : FEE_RATE_APPOINTMENT;
    const platformFee = Math.round(grossCommission * feeRate);
    const netAmount = grossCommission - platformFee;

    // Deduct from founder wallet if funds available
    const { data: wallet } = await supabase
      .from("founder_wallets")
      .select("balance, total_spent")
      .eq("founder_id", user.id)
      .single();

    if (wallet && wallet.balance >= grossCommission) {
      const newBalance = wallet.balance - grossCommission;
      await supabase
        .from("founder_wallets")
        .update({
          balance: newBalance,
          total_spent: (wallet.total_spent || 0) + grossCommission,
          updated_at: new Date().toISOString(),
        })
        .eq("founder_id", user.id);

      await supabase.from("wallet_transactions").insert({
        founder_id: user.id,
        type: "payout_deduct",
        amount: grossCommission,
        balance_after: newBalance,
        reference_id: apt.id,
        description: `Auto-approved: $${(grossCommission / 100).toFixed(2)}`,
      });
    }

    await supabase
      .from("appointments")
      .update({ status: "auto_approved" })
      .eq("id", apt.id)
      .eq("status", "submitted");

    const clearsAt = new Date();
    clearsAt.setDate(clearsAt.getDate() + PAYOUT_CLEARING_DAYS);

    await supabase.from("payouts").insert({
      founder_id: user.id,
      setter_id: apt.setter_id,
      appointment_id: apt.id,
      amount: netAmount,
      gross_amount: grossCommission,
      platform_fee: platformFee,
      clears_at: clearsAt.toISOString(),
      status: "pending",
    });

    approved++;
  }

  if (approved > 0) {
    revalidatePath("/dashboard/founder/appointments");
    revalidatePath("/dashboard/founder/earnings");
  }

  return { count: approved };
}

// ─── Listing Management ─────────────────────────────────────────────

export async function deleteListing(listingId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!listingId) return { error: "Listing ID required" };

  // Verify ownership and check for active appointments
  const { data: listing } = await supabase
    .from("listings")
    .select("id, status")
    .eq("id", listingId)
    .eq("company_id", user.id)
    .single();

  if (!listing) return { error: "Listing not found or not authorized" };

  // Check for pending appointments — don't allow delete if any exist
  const { count: pendingCount } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId)
    .eq("status", "submitted");

  if ((pendingCount || 0) > 0) {
    return { error: "Cannot delete listing with pending appointments. Resolve them first." };
  }

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("company_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/founder/listings");
  return { success: true };
}

// ─── Setter Withdrawals ─────────────────────────────────────────────

export async function requestWithdrawal(amountCents: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (amountCents < MIN_WITHDRAWAL_CENTS) {
    return { error: `Minimum withdrawal is $${(MIN_WITHDRAWAL_CENTS / 100).toFixed(2)}` };
  }

  // Calculate available (cleared) balance
  const now = new Date().toISOString();
  const { data: clearedPayouts } = await supabase
    .from("payouts")
    .select("amount")
    .eq("setter_id", user.id)
    .eq("status", "pending")
    .lte("clears_at", now);

  const { data: existingWithdrawals } = await supabase
    .from("setter_withdrawals")
    .select("amount")
    .eq("setter_id", user.id)
    .in("status", ["pending", "processing"]);

  const clearedTotal = (clearedPayouts || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  const { data: paidPayouts } = await supabase
    .from("payouts")
    .select("amount")
    .eq("setter_id", user.id)
    .eq("status", "paid");
  const alreadyPaid = (paidPayouts || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingWithdrawals = (existingWithdrawals || []).reduce((sum, w) => sum + (w.amount || 0), 0);
  const { data: completedWithdrawals } = await supabase
    .from("setter_withdrawals")
    .select("amount")
    .eq("setter_id", user.id)
    .eq("status", "paid");
  const completedTotal = (completedWithdrawals || []).reduce((sum, w) => sum + (w.amount || 0), 0);

  const available = clearedTotal + alreadyPaid - pendingWithdrawals - completedTotal;

  if (available < amountCents) {
    return { error: `Insufficient cleared balance. Available: $${(Math.max(0, available) / 100).toFixed(2)}` };
  }

  const { error } = await supabase.from("setter_withdrawals").insert({
    setter_id: user.id,
    amount: amountCents,
    status: "pending",
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/setter/earnings");
  return { success: true };
}

// ─── Lead Registration ──────────────────────────────────────────────

export async function registerLead(listingId: string, contactEmail: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!listingId) return { error: "Listing ID required" };
  if (!contactEmail?.trim()) return { error: "Contact email is required" };
  if (!isValidEmail(contactEmail.trim())) return { error: "Invalid email format" };

  // Verify setter has approved application for this listing
  const { data: application } = await supabase
    .from("setter_applications")
    .select("id")
    .eq("setter_id", user.id)
    .eq("listing_id", listingId)
    .eq("status", "approved")
    .single();
  if (!application) return { error: "You must have an approved application for this listing" };

  // Check if this email is already registered for this listing (by any setter)
  const { data: existing } = await supabase
    .from("lead_registrations")
    .select("id, setter_id")
    .eq("listing_id", listingId)
    .eq("contact_email", contactEmail.trim().toLowerCase())
    .gt("expires_at", new Date().toISOString())
    .single();

  if (existing) {
    if (existing.setter_id === user.id) {
      return { error: "You already registered this lead" };
    }
    return { error: "This prospect has already been claimed by another setter for this listing" };
  }

  const { error } = await supabase.from("lead_registrations").insert({
    setter_id: user.id,
    listing_id: listingId,
    contact_email: contactEmail.trim().toLowerCase(),
  });

  if (error) {
    if (error.message.includes("duplicate") || error.message.includes("unique")) {
      return { error: "This prospect has already been claimed for this listing" };
    }
    return { error: error.message };
  }

  return { success: true };
}
