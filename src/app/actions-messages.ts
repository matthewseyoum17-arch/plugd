"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Get conversations list ─────────────────────────────────────────

export async function getConversations() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", conversations: [] };

  // Get all messages where user is sender or receiver
  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, receiver_id, content, read, created_at")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (!messages || messages.length === 0) return { conversations: [] };

  // Group by other participant
  const convMap = new Map<string, {
    other_id: string;
    last_message: string;
    last_at: string;
    unread_count: number;
  }>();

  for (const msg of messages) {
    const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    if (!convMap.has(otherId)) {
      convMap.set(otherId, {
        other_id: otherId,
        last_message: msg.content,
        last_at: msg.created_at,
        unread_count: 0,
      });
    }
    if (msg.receiver_id === user.id && !msg.read) {
      const conv = convMap.get(otherId)!;
      conv.unread_count += 1;
    }
  }

  // Fetch user info for each participant
  const otherIds = Array.from(convMap.keys());
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, role")
    .in("id", otherIds);

  const conversations = Array.from(convMap.values()).map((conv) => {
    const otherUser = users?.find((u) => u.id === conv.other_id);
    return {
      ...conv,
      other_name: otherUser?.full_name || "Unknown",
      other_role: otherUser?.role || "unknown",
    };
  });

  // Sort by last message time
  conversations.sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime());

  return { conversations };
}

// ─── Get messages in a thread ───────────────────────────────────────

export async function getThread(otherUserId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", messages: [] };

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, receiver_id, content, read, created_at")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true });

  // Mark unread messages as read
  if (messages && messages.length > 0) {
    const unreadIds = messages
      .filter((m) => m.receiver_id === user.id && !m.read)
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from("messages")
        .update({ read: true })
        .in("id", unreadIds);
    }
  }

  // Get other user info
  const { data: otherUser } = await supabase
    .from("users")
    .select("id, full_name, role")
    .eq("id", otherUserId)
    .single();

  return {
    messages: messages || [],
    otherUser: otherUser || { id: otherUserId, full_name: "Unknown", role: "unknown" },
    currentUserId: user.id,
  };
}

// ─── Send a message ─────────────────────────────────────────────────

export async function sendMessage(receiverId: string, content: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!content?.trim()) return { error: "Message cannot be empty" };
  if (content.length > 5000) return { error: "Message too long (max 5000 chars)" };
  if (receiverId === user.id) return { error: "Cannot message yourself" };

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content: content.trim(),
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/founder/messages");
  revalidatePath("/dashboard/setter/messages");
  return { success: true };
}

// ─── Get unread count ───────────────────────────────────────────────

export async function getUnreadCount() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { count: 0 };

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("read", false);

  return { count: count || 0 };
}
