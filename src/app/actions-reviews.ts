"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReview(input: {
  appointmentId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!input.rating || input.rating < 1 || input.rating > 5) {
    return { error: "Rating must be between 1 and 5" };
  }
  if (input.comment && input.comment.length > 1000) {
    return { error: "Comment too long (max 1000 chars)" };
  }
  if (input.revieweeId === user.id) {
    return { error: "Cannot review yourself" };
  }

  // Verify appointment exists and user is involved
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, setter_id, company_id, status")
    .eq("id", input.appointmentId)
    .single();

  if (!appointment) return { error: "Appointment not found" };
  if (appointment.status !== "confirmed" && appointment.status !== "auto_approved") {
    return { error: "Can only review confirmed appointments" };
  }
  if (appointment.setter_id !== user.id && appointment.company_id !== user.id) {
    return { error: "Not authorized to review this appointment" };
  }

  // Check if already reviewed
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("reviewer_id", user.id)
    .eq("appointment_id", input.appointmentId)
    .maybeSingle();

  if (existing) return { error: "You've already reviewed this appointment" };

  const { error } = await supabase.from("reviews").insert({
    reviewer_id: user.id,
    reviewee_id: input.revieweeId,
    appointment_id: input.appointmentId,
    rating: Math.round(input.rating),
    comment: input.comment?.trim() || null,
  });

  if (error) {
    if (error.message.includes("duplicate") || error.message.includes("unique")) {
      return { error: "You've already reviewed this appointment" };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard/founder/appointments");
  revalidatePath("/dashboard/setter/appointments");
  return { success: true };
}

export async function getReviewsForUser(userId: string) {
  const supabase = createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, users!reviews_reviewer_id_fkey(full_name)")
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false });

  const ratings = reviews?.map((r) => r.rating) || [];
  const avg = ratings.length > 0
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;

  return {
    reviews: reviews || [],
    avgRating: Math.round(avg * 10) / 10,
    count: ratings.length,
  };
}
