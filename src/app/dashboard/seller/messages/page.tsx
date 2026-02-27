import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MessagesPageClient from "@/components/messages-page";

export const dynamic = "force-dynamic";

export default async function SellerMessagesPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <MessagesPageClient />;
}
