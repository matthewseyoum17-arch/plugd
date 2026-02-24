"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Listings ────────────────────────────────────────────────────────

export async function toggleListingStatus(listingId: string, newStatus: "active" | "paused") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("listings")
    .update({ status: newStatus })
    .eq("id", listingId)
    .eq("company_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/founder/listings");
  return { success: true };
}

// ─── Applications ────────────────────────────────────────────────────

export async function applyToListing(listingId: string, sampleEmail: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Prevent duplicates
  const { data: existing } = await supabase
    .from("setter_applications")
    .select("id")
    .eq("setter_id", user.id)
    .eq("listing_id", listingId)
    .single();
  if (existing) return { error: "Already applied" };

  const { error } = await supabase.from("setter_applications").insert({
    setter_id: user.id,
    listing_id: listingId,
    sample_email: sampleEmail || null,
    status: "pending",
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/setter/browse");
  return { success: true };
}

export async function updateApplicationStatus(applicationId: string, status: "approved" | "rejected") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify founder owns the listing this application belongs to
  const { data: owned } = await supabase
    .from("setter_applications")
    .select("id, listings!inner(company_id)")
    .eq("id", applicationId)
    .eq("listings.company_id", user.id)
    .single();
  if (!owned) return { error: "Not authorized" };

  const { error } = await supabase
    .from("setter_applications")
    .update({ status })
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
  notes?: string;
};

export async function submitAppointment(input: SubmitAppointmentInput) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!input.listing_id) return { error: "Please select a listing" };

  // Verify setter has approved application for this listing
  const { data: application } = await supabase
    .from("setter_applications")
    .select("id")
    .eq("setter_id", user.id)
    .eq("listing_id", input.listing_id)
    .eq("status", "approved")
    .single();
  if (!application) return { error: "No approved application for this listing" };

  // Get listing for company_id
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
    notes: input.notes || null,
    status: "submitted",
    submitted_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/setter/appointments");
  return { success: true };
}

export async function confirmAppointment(appointmentId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Fetch appointment with listing commission data — also verifies ownership
  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("id, setter_id, appointment_type, listings(commission_per_appointment, commission_per_close)")
    .eq("id", appointmentId)
    .eq("company_id", user.id)
    .single();

  if (fetchError || !appointment) return { error: "Appointment not found or not authorized" };

  const { error: updateError } = await supabase
    .from("appointments")
    .update({ status: "confirmed" })
    .eq("id", appointmentId)
    .eq("company_id", user.id);

  if (updateError) return { error: updateError.message };

  // Calculate payout with platform fee deduction
  const listing = appointment.listings as unknown as {
    commission_per_appointment: number;
    commission_per_close: number;
  } | null;
  const grossCommission = appointment.appointment_type === "close"
    ? listing?.commission_per_close || 0
    : listing?.commission_per_appointment || 0;
  const feeRate = appointment.appointment_type === "close" ? 0.05 : 0.07;
  const amount = Math.round(grossCommission * (1 - feeRate));

  const { error: payoutError } = await supabase.from("payouts").insert({
    founder_id: user.id,
    setter_id: appointment.setter_id,
    appointment_id: appointmentId,
    amount,
    status: "pending",
  });

  if (payoutError) return { error: payoutError.message };
  revalidatePath("/dashboard/founder/appointments");
  return { success: true };
}

export async function disputeAppointment(appointmentId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("appointments")
    .update({ status: "disputed" })
    .eq("id", appointmentId)
    .eq("company_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/founder/appointments");
  return { success: true };
}
