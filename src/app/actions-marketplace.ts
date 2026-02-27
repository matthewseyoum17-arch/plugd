"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Gig Management ──────────────────────────────────────────────────

export async function updateGig(
  gigId: string,
  data: {
    title?: string;
    description?: string;
    category_id?: string | null;
    search_tags?: string[];
    price_basic_cents?: number;
    price_basic_delivery_days?: number;
    price_basic_revisions?: number;
    price_basic_description?: string;
    price_standard_cents?: number | null;
    price_standard_delivery_days?: number;
    price_standard_revisions?: number;
    price_standard_description?: string;
    price_premium_cents?: number | null;
    price_premium_delivery_days?: number;
    price_premium_revisions?: number;
    price_premium_description?: string;
    status?: string;
  }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify ownership
  const { data: gig } = await supabase
    .from("gigs")
    .select("seller_id")
    .eq("id", gigId)
    .single();

  if (!gig || gig.seller_id !== user.id) {
    return { error: "You can only edit your own gigs" };
  }

  const { error } = await supabase
    .from("gigs")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", gigId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/seller/gigs");
  revalidatePath(`/gig/${gigId}`);
  return { success: true };
}

export async function toggleGigStatus(
  gigId: string,
  newStatus: "active" | "paused"
) {
  return updateGig(gigId, { status: newStatus });
}

export async function deleteGig(gigId: string) {
  return updateGig(gigId, { status: "deleted" });
}

// ─── Orders ─────────────────────────────────────────────────────────

const PLATFORM_FEE_RATE = 0.2; // 20% platform fee on orders

export async function createOrder(
  gigId: string,
  packageTier: "basic" | "standard" | "premium"
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Fetch gig
  const { data: gig, error: gigError } = await supabase
    .from("gigs")
    .select("*")
    .eq("id", gigId)
    .eq("status", "active")
    .single();

  if (gigError || !gig) return { error: "Gig not found or not active" };
  if (gig.seller_id === user.id) return { error: "Cannot order your own gig" };

  // Get pricing for selected tier
  const tierMap: Record<string, { price: string; delivery: string; revisions: string; name: string; desc: string }> = {
    basic: {
      price: "price_basic_cents",
      delivery: "price_basic_delivery_days",
      revisions: "price_basic_revisions",
      name: "price_basic_name",
      desc: "price_basic_description",
    },
    standard: {
      price: "price_standard_cents",
      delivery: "price_standard_delivery_days",
      revisions: "price_standard_revisions",
      name: "price_standard_name",
      desc: "price_standard_description",
    },
    premium: {
      price: "price_premium_cents",
      delivery: "price_premium_delivery_days",
      revisions: "price_premium_revisions",
      name: "price_premium_name",
      desc: "price_premium_description",
    },
  };

  const tier = tierMap[packageTier];
  const priceCents = gig[tier.price];
  if (!priceCents) return { error: "Package tier not available" };

  const serviceFee = Math.round(priceCents * PLATFORM_FEE_RATE);
  const totalCents = priceCents + serviceFee;
  const deliveryDays = gig[tier.delivery] || 7;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + deliveryDays);

  // Generate order number
  const orderNumber = `GF-${Date.now().toString(36).toUpperCase()}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      buyer_id: user.id,
      seller_id: gig.seller_id,
      gig_id: gigId,
      package_tier: packageTier,
      package_name: gig[tier.name] || packageTier,
      package_description: gig[tier.desc] || "",
      price_cents: priceCents,
      service_fee_cents: serviceFee,
      total_cents: totalCents,
      delivery_days: deliveryDays,
      revisions_included: gig[tier.revisions] || 1,
      status: "pending",
      due_at: dueDate.toISOString(),
    })
    .select("id")
    .single();

  if (orderError) return { error: orderError.message };

  // Increment orders_completed on gig
  await supabase.rpc("increment_gig_orders", { gig_id: gigId });

  revalidatePath("/dashboard/seller/orders");
  return { success: true, orderId: order?.id };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: "in_progress" | "delivered" | "revision" | "completed" | "cancelled"
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: order } = await supabase
    .from("orders")
    .select("buyer_id, seller_id, status")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Order not found" };

  // Sellers can mark as in_progress, delivered
  // Buyers can request revision, complete, cancel
  const isSeller = order.seller_id === user.id;
  const isBuyer = order.buyer_id === user.id;

  if (!isSeller && !isBuyer) return { error: "Not authorized" };

  const sellerAllowed = ["in_progress", "delivered"];
  const buyerAllowed = ["revision", "completed", "cancelled"];

  if (isSeller && !sellerAllowed.includes(newStatus)) {
    return { error: "Sellers can only mark orders as in progress or delivered" };
  }
  if (isBuyer && !buyerAllowed.includes(newStatus)) {
    return { error: "Buyers can only request revision, complete, or cancel" };
  }

  const updateData: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "in_progress") updateData.started_at = new Date().toISOString();
  if (newStatus === "delivered") updateData.delivered_at = new Date().toISOString();
  if (newStatus === "completed") updateData.completed_at = new Date().toISOString();

  const { error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/seller/orders");
  return { success: true };
}

// ─── Favorites ──────────────────────────────────────────────────────

export async function toggleFavorite(gigId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("gig_id", gigId)
    .single();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    return { favorited: false };
  } else {
    await supabase.from("favorites").insert({ user_id: user.id, gig_id: gigId });
    return { favorited: true };
  }
}

// ─── Reviews ────────────────────────────────────────────────────────

export async function submitGigReview(
  orderId: string,
  rating: number,
  comment: string
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (rating < 1 || rating > 5) return { error: "Rating must be 1-5" };

  // Fetch order to verify buyer and completion
  const { data: order } = await supabase
    .from("orders")
    .select("buyer_id, seller_id, gig_id, status")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Order not found" };
  if (order.buyer_id !== user.id) return { error: "Only buyers can leave reviews" };
  if (order.status !== "completed") return { error: "Order must be completed first" };

  const { error } = await supabase.from("gig_reviews").insert({
    order_id: orderId,
    gig_id: order.gig_id,
    reviewer_id: user.id,
    seller_id: order.seller_id,
    rating,
    comment: comment.trim() || null,
  });

  if (error) {
    if (error.message.includes("duplicate")) {
      return { error: "You already reviewed this order" };
    }
    return { error: error.message };
  }

  // Update gig average rating
  const { data: reviews } = await supabase
    .from("gig_reviews")
    .select("rating")
    .eq("gig_id", order.gig_id);

  if (reviews && reviews.length > 0) {
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await supabase
      .from("gigs")
      .update({
        average_rating: Math.round(avg * 100) / 100,
        review_count: reviews.length,
      })
      .eq("id", order.gig_id);
  }

  revalidatePath(`/gig/${order.gig_id}`);
  return { success: true };
}

export async function respondToReview(reviewId: string, response: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: review } = await supabase
    .from("gig_reviews")
    .select("seller_id, gig_id")
    .eq("id", reviewId)
    .single();

  if (!review || review.seller_id !== user.id) {
    return { error: "Only the seller can respond" };
  }

  const { error } = await supabase
    .from("gig_reviews")
    .update({ seller_response: response.trim() })
    .eq("id", reviewId);

  if (error) return { error: error.message };

  revalidatePath(`/gig/${review.gig_id}`);
  return { success: true };
}
