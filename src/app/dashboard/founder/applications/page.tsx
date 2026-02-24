import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ApplicationActions } from "./_components/ApplicationActions";

export const dynamic = 'force-dynamic'

export default async function Applications() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.user_metadata?.role !== "founder") redirect("/dashboard/setter");

  const { data: myListings } = await supabase
    .from("listings")
    .select("id")
    .eq("company_id", user.id);

  const myListingIds = (myListings || []).map((l) => l.id);

  const { data: applications } = myListingIds.length
    ? await supabase
        .from("setter_applications")
        .select("*, listings(title), users!setter_applications_setter_id_fkey(full_name, email)")
        .in("listing_id", myListingIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const statusColor = (s: string) => {
    if (s === "approved") return "bg-green-900/20 text-green-400 border border-green-800";
    if (s === "rejected") return "bg-red-900/20 text-red-400 border border-red-800";
    return "bg-orange-900/20 text-orange-400 border border-orange-800";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">Setter Applications</h1>
        <p className="text-gray-400 mt-2">Review and manage setters who want to promote your products.</p>
      </div>
      <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-black/40 border-b border-white/5">
            <tr>
              {["Setter","Product","Sample Email","Applied","Status","Actions"].map(h => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(applications || []).map((app: any) => (
              <tr key={app.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-white">{app.users?.full_name || "Unknown"}</div>
                  <div className="text-xs text-gray-500">{app.users?.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">{app.listings?.title || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{app.sample_email || "—"}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(app.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <ApplicationActions applicationId={app.id} currentStatus={app.status} />
                </td>
              </tr>
            ))}
            {(!applications || applications.length === 0) && (
              <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400">No applications yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
