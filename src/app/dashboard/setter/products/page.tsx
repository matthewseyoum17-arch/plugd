import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MyProducts() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role;
  if (role !== "setter") {
    redirect("/dashboard/founder");
  }

  const { data: applications } = await supabase
    .from("setter_applications")
    .select("*, listings(*)")
    .eq("setter_id", user.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-primary/10 text-primary border border-primary/20";
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
          My Products
        </h1>
        <p className="text-gray-400 mt-2 font-medium">
          Products you are approved to promote. Submit appointments here.
        </p>
      </div>

      <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-black/40 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-button font-semibold text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-button font-semibold text-gray-400 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-4 text-left text-xs font-button font-semibold text-gray-400 uppercase tracking-wider">
                $/Appt
              </th>
              <th className="px-6 py-4 text-left text-xs font-button font-semibold text-gray-400 uppercase tracking-wider">
                $/Close
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
                <td className="px-6 py-4 text-sm font-medium text-white">
                  {app.listings?.title || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-300">
                  {app.listings?.company_name || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-accent">
                  $
                  {(
                    (app.listings?.commission_per_appointment || 0) / 100
                  ).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-primary">
                  $
                  {((app.listings?.commission_per_close || 0) / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-button ${getStatusColor(app.status)}`}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/setter/products/${app.listing_id}/submit`}
                    className="inline-flex px-4 py-2 bg-white text-black text-xs font-button font-semibold rounded-lg hover:bg-gray-200 transition-colors shadow-lg"
                  >
                    Submit Appointment
                  </Link>
                </td>
              </tr>
            ))}
            {(!applications || applications.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <p className="text-gray-400 font-medium">
                    You haven&apos;t been approved for any products yet.
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
