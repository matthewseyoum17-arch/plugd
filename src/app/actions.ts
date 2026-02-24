"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type CreateListingInput = {
  title: string;
  description: string;
  ideal_customer: string;
  product_url: string;
  commission_per_appointment: number;
  commission_per_close: number;
  qualified_meeting_definition: string;
  pitch_kit_url: string;
};

export async function createListing(input: CreateListingInput) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

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
    commission_per_close: input.commission_per_close,
    qualified_meeting_definition: input.qualified_meeting_definition,
    pitch_kit_url: input.pitch_kit_url,
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
    .update({ status: newStatus })
    .eq("id", listingId)
    .eq("company_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/founder/listings");
  return { success: true };
}

export async function applyToListing(listingId: string, sampleEmail?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
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

export async function updateApplicationStatus(applicationId: string, status: "approved" | "rejected") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("setter_applications")
    .update({ status })
    .eq("id", applicationId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/founder/applications");
  return { success: true };
}

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

  const { data: application } = await supabase
    .from("setter_applications")
    .select("id")
    .eq("setter_id", user.id)
    .eq("listing_id", input.listing_id)
    .eq("status", "approved")
    .single();

  if (!application) return { error: "No approved application for this listing" };

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

export async function confirmAppointment(
  appointmentId: string,
  setterId: string,
  commissionPerAppointment: number,
  commissionPerClose: number,
  appointmentType: string
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error: updateError } = await supabase
    .from("appointments")
    .update({ status: "confirmed" })
    .eq("id", appointmentId)
    .eq("company_id", user.id);

  if (updateError) return { error: updateError.message };

  const base = appointmentType === "close" ? commissionPerClose : commissionPerAppointment;
  const fee = appointmentType === "close" ? 0.05 : 0.07;
  const amount = Math.round(base * (1 - fee));

  const { error: payoutError } = await supabase.from("payouts").insert({
    founder_id: user.id,
    setter_id: setterId,
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
