import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ApplicationActions } from "./_components/ApplicationActions";

export default async function Applications() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role;
  if (role !== "founder") {
    redirect("/dashboard/setter");
  }

  const { data: applications } = await supabase
    .from("setter_applications")
    .select(
      "*, listings(title), setter_profiles(setter_id, users!setter_profiles_setter_id_fkey(full_name, email))",
    )
    .eq("listings.company_id", user.id)
    .order("created_at", { ascending: false });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-neon/10 text-neon border border-neon/20";
      case "pending":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-white/5 text-gray-400 border border-white/10";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">
          Setter Applications
        </h1>
        <p className="text-gray-400 mt-2 font-medium">
          Review and manage setters who want to promote your products.
        </p>
      </div>

      <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-black/40 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-button font-semibold text-gray-400 uppercase tracking-wider">
                Setter
              </th>
              <th className="px-6 py-4 text-left text-xs font-button font-semibold text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-button font-semibold text-gray-400 uppercase tracking-wider">
                Applied
              </th>
              <th className="px-6 py-4 text-left text-xs font-button font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-button font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {applications?.map((app) => (
              <tr
                key={app.id}
                className="hover:bg-white/5 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-white">
                    {app.setter_profiles?.users?.full_name || "Unknown"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {app.setter_profiles?.users?.email}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-300">
                  {app.listings?.title || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-button ${getStatusColor(app.status)}`}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <ApplicationActions
                    applicationId={app.id}
                    currentStatus={app.status}
                  />
                </td>
              </tr>
            ))}
            {(!applications || applications.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <p className="text-gray-400 font-medium">
                    No applications yet.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
