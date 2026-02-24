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
    .select("id, status")
    .eq("id", listingId)
    .eq("status", "active")
    .single();
  if (!listing) return { error: "Listing not found or no longer active" };

  // Insert with conflict handling — if a unique constraint exists on
  // (setter_id, listing_id), this prevents the race condition.
  // If no constraint, the select-then-insert still catches most cases.
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
    sample_email: sampleEmail.trim(),
    status: "pending",
  });

  if (error) {
    // Handle unique constraint violation gracefully
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
    .select("company_id, status")
    .eq("id", input.listing_id)
    .single();
  if (!listing) return { error: "Listing not found" };
  if (listing.status !== "active") return { error: "This listing is paused and not accepting appointments" };

  const { error } = await supabase.from("appointments").insert({
    setter_id: user.id,
    listing_id: input.listing_id,
    company_id: listing.company_id,
    contact_name: input.contact_name.trim(),
    contact_email: input.contact_email.trim().toLowerCase(),
    contact_company: input.contact_company.trim(),
    calendly_event_url: input.calendly_event_url.trim(),
    appointment_type: input.appointment_type,
    notes: input.notes?.trim() || null,
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

  // ── Prevent duplicate payouts ──
  // Check if a payout already exists for this appointment BEFORE doing anything
  const { data: existingPayout } = await supabase
    .from("payouts")
    .select("id")
    .eq("appointment_id", appointmentId)
    .maybeSingle();
  if (existingPayout) return { error: "This appointment has already been confirmed" };

  // Fetch appointment with listing commission data — also verifies ownership
  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("id, setter_id, status, appointment_type, listings(commission_per_appointment, commission_per_close)")
    .eq("id", appointmentId)
    .eq("company_id", user.id)
    .single();

  if (fetchError || !appointment) return { error: "Appointment not found or not authorized" };

  // Only allow confirming submitted appointments
  if (appointment.status !== "submitted") {
    return { error: `Cannot confirm an appointment with status "${appointment.status}"` };
  }

  const { error: updateError } = await supabase
    .from("appointments")
    .update({ status: "confirmed" })
    .eq("id", appointmentId)
    .eq("company_id", user.id)
    .eq("status", "submitted"); // Extra guard: only update if still submitted

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

  if (payoutError) {
    // If payout insert fails due to duplicate, that's fine — appointment is confirmed
    if (payoutError.message.includes("duplicate") || payoutError.message.includes("unique")) {
      revalidatePath("/dashboard/founder/appointments");
      return { success: true };
    }
    return { error: payoutError.message };
  }
  revalidatePath("/dashboard/founder/appointments");
  return { success: true };
}

export async function disputeAppointment(appointmentId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Only allow disputing submitted appointments
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
    .eq("status", "submitted"); // Only update if still submitted

  if (error) return { error: error.message };
  revalidatePath("/dashboard/founder/appointments");
  return { success: true };
}
