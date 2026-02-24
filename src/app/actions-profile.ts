"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Get any user's public profile ──────────────────────────────────

export async function getPublicProfile(userId: string) {
  const supabase = createClient();

  const { data: user } = await supabase
    .from("users")
    .select("id, full_name, role, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (!user) return { error: "User not found" };

  let profile = null;
  if (user.role === "setter") {
    const { data } = await supabase
      .from("setter_profiles")
      .select("*")
      .eq("setter_id", userId)
      .maybeSingle();
    profile = data;
  } else {
    const { data } = await supabase
      .from("founder_profiles")
      .select("*")
      .eq("founder_id", userId)
      .maybeSingle();
    profile = data;
  }

  // Get review stats
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, comment, created_at, reviewer_id, users!reviews_reviewer_id_fkey(full_name)")
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const allRatings = reviews?.map((r) => r.rating) || [];
  const avgRating = allRatings.length > 0
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    : 0;

  // Get stats
  let stats = {};
  if (user.role === "setter") {
    const { count: apptCount } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("setter_id", userId);
    const { count: confirmedCount } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("setter_id", userId)
      .in("status", ["confirmed", "auto_approved"]);
    stats = {
      total_appointments: apptCount || 0,
      confirmed_appointments: confirmedCount || 0,
    };
  } else {
    const { count: listingCount } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("company_id", userId)
      .eq("status", "active");
    stats = {
      active_listings: listingCount || 0,
    };
  }

  return {
    user,
    profile,
    reviews: reviews || [],
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount: allRatings.length,
    stats,
  };
}

// ─── Update own profile ─────────────────────────────────────────────

type SetterProfileInput = {
  headline?: string;
  bio?: string;
  industries?: string;
  location?: string;
  linkedin_url?: string;
};

type FounderProfileInput = {
  headline?: string;
  bio?: string;
  website?: string;
  location?: string;
  industry?: string;
  company_name?: string;
};

export async function updateSetterProfile(input: SetterProfileInput) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (input.headline && input.headline.length > 120) return { error: "Headline too long (max 120 chars)" };
  if (input.bio && input.bio.length > 1000) return { error: "Bio too long (max 1000 chars)" };

  const { error } = await supabase
    .from("setter_profiles")
    .upsert({
      setter_id: user.id,
      headline: input.headline?.trim() || null,
      bio: input.bio?.trim() || null,
      industries: input.industries?.trim() || null,
      location: input.location?.trim() || null,
      linkedin_url: input.linkedin_url?.trim() || null,
    }, { onConflict: "setter_id" });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/setter/profile");
  return { success: true };
}

export async function updateFounderProfile(input: FounderProfileInput) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (input.headline && input.headline.length > 120) return { error: "Headline too long (max 120 chars)" };
  if (input.bio && input.bio.length > 1000) return { error: "Bio too long (max 1000 chars)" };

  const { error } = await supabase
    .from("founder_profiles")
    .upsert({
      founder_id: user.id,
      headline: input.headline?.trim() || null,
      bio: input.bio?.trim() || null,
      website: input.website?.trim() || null,
      location: input.location?.trim() || null,
      industry: input.industry?.trim() || null,
      company_name: input.company_name?.trim() || null,
    }, { onConflict: "founder_id" });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/founder/profile");
  return { success: true };
}
