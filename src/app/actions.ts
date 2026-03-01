"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type CreateListingInput = {
  title: string;
  description: string;
  ideal_customer: string;
  product_url: string;
  commission_per_appointment: number;
  commission_per_close?: number;
  qualified_meeting_definition: string;
  pitch_kit_url: string;
  max_setters?: number;
};

export async function createListing(input: CreateListingInput) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  if (input.commission_per_appointment < 2500)
    return { error: "Minimum commission is $25 per appointment" };

  const { data: profile } = await supabase
    .from("founder_profiles")
    .select("company_name")
    .eq("founder_id", user.id)
    .single();

  const { error } = await supabase.from("listings").insert({
    company_id: user.id,
    company_name: profile?.company_name || "",
    title: input.title,
    description: input.description,
    ideal_customer: input.ideal_customer,
    product_url: input.product_url,
    commission_per_appointment: input.commission_per_appointment,
    qualified_meeting_definition: input.qualified_meeting_definition,
    pitch_kit_url: input.pitch_kit_url,
    max_setters: input.max_setters,
    status: "active",
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/founder/listings");
  return { success: true };
}

export async function toggleListingStatus(listingId: string, newStatus: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("listings")
    .update({ status: newStatus, paused_reason: null })
    .eq("id", listingId)
    .eq("company_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/founder/listings");
  return { success: true };
}

// ─── Appointment Actions ───

export async function confirmAppointment(
  appointmentId: string,
  setterId: string,
  commissionAmount: number,
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error: updateError } = await supabase
    .from("appointments")
    .update({ status: "confirmed" })
    .eq("id", appointmentId)
    .eq("company_id", user.id);

  if (updateError) return { error: updateError.message };

  const platformFee = Math.round(commissionAmount * 0.07);
  const { error: payoutError } = await supabase.from("payouts").insert({
    founder_id: user.id,
    setter_id: setterId,
    appointment_id: appointmentId,
    amount: commissionAmount - platformFee,
    status: "pending",
  });

  if (payoutError) return { error: payoutError.message };

  revalidatePath("/dashboard/founder/appointments");
  return { success: true };
}

export async function disputeAppointment(appointmentId: string, reason?: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("appointments")
    .update({ status: "disputed", dispute_reason: reason || null })
    .eq("id", appointmentId)
    .eq("company_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/founder/appointments");
  revalidatePath("/dashboard/founder/disputes");
  return { success: true };
}

export async function resolveDispute(
  appointmentId: string,
  resolution: "confirmed" | "rejected",
  notes?: string,
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("appointments")
    .update({
      status: resolution,
      dispute_resolution: notes || null,
      dispute_resolved_at: new Date().toISOString(),
    })
    .eq("id", appointmentId)
    .eq("company_id", user.id)
    .eq("status", "disputed");

  if (error) return { error: error.message };

  // If resolved as confirmed, create the payout
  if (resolution === "confirmed") {
    const { data: appointment } = await supabase
      .from("appointments")
      .select("setter_id, listing_id, appointment_type, listings(commission_per_appointment, commission_per_close)")
      .eq("id", appointmentId)
      .single();

    if (appointment) {
      const commission =
        appointment.appointment_type === "appointment"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (appointment.listings as any)?.commission_per_appointment || 0
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          : (appointment.listings as any)?.commission_per_close || 0;
      const platformFee = Math.round(commission * 0.07);

      await supabase.from("payouts").insert({
        founder_id: user.id,
        setter_id: appointment.setter_id,
        appointment_id: appointmentId,
        amount: commission - platformFee,
        status: "pending",
      });
    }
  }

  revalidatePath("/dashboard/founder/appointments");
  revalidatePath("/dashboard/founder/disputes");
  return { success: true };
}

// ─── Lead Registration ───

export async function registerLead(input: {
  listing_id: string;
  contact_email: string;
  contact_name?: string;
  contact_company?: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("lead_registrations").insert({
    setter_id: user.id,
    listing_id: input.listing_id,
    contact_email: input.contact_email,
    contact_name: input.contact_name || null,
    contact_company: input.contact_company || null,
  });

  if (error) {
    if (error.code === "23505")
      return { error: "This lead is already registered for this listing" };
    return { error: error.message };
  }

  revalidatePath("/dashboard/setter/products");
  return { success: true };
}

// ─── Withdrawal Requests ───

export async function requestWithdrawal(amount: number) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (amount < 1000) return { error: "Minimum withdrawal is $10.00" };

  // Verify available balance
  const { data: payouts } = await supabase
    .from("payouts")
    .select("amount")
    .eq("setter_id", user.id)
    .eq("status", "pending");

  const { data: existingWithdrawals } = await supabase
    .from("withdrawal_requests")
    .select("amount")
    .eq("setter_id", user.id)
    .in("status", ["pending", "processing"]);

  const available =
    (payouts?.reduce((s, p) => s + (p.amount || 0), 0) || 0) -
    (existingWithdrawals?.reduce((s, w) => s + (w.amount || 0), 0) || 0);

  if (amount > available)
    return { error: `Insufficient balance. Available: $${(available / 100).toFixed(2)}` };

  const { error } = await supabase.from("withdrawal_requests").insert({
    setter_id: user.id,
    amount,
    status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/setter/earnings");
  revalidatePath("/dashboard/setter/withdrawals");
  return { success: true };
}

// ─── Setter Application Actions ───

export async function applyToListing(listingId: string, sampleEmail?: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("setter_applications").insert({
    setter_id: user.id,
    listing_id: listingId,
    sample_email: sampleEmail || null,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") return { error: "Already applied" };
    return { error: error.message };
  }

  revalidatePath("/dashboard/setter/browse");
  return { success: true };
}

// ─── Setter Appointment Submission ───

type SubmitAppointmentInput = {
  listing_id: string;
  contact_name: string;
  contact_email: string;
  contact_company: string;
  calendly_event_url: string;
  appointment_type: string;
};

export async function submitAppointment(input: SubmitAppointmentInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify setter has an approved application for this listing
  const { data: application } = await supabase
    .from("setter_applications")
    .select("id")
    .eq("setter_id", user.id)
    .eq("listing_id", input.listing_id)
    .eq("status", "approved")
    .single();

  if (!application)
    return { error: "No approved application for this listing" };

  // Get listing company_id
  const { data: listing } = await supabase
    .from("listings")
    .select("company_id")
    .eq("id", input.listing_id)
    .single();

  if (!listing) return { error: "Listing not found" };

  const { error } = await supabase.from("appointments").insert({
    setter_id: user.id,
    listing_id: input.listing_id,
    company_id: listing.company_id,
    contact_name: input.contact_name,
    contact_email: input.contact_email,
    contact_company: input.contact_company,
    calendly_event_url: input.calendly_event_url,
    appointment_type: input.appointment_type,
    status: "submitted",
    submitted_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/setter/appointments");
  return { success: true };
}
