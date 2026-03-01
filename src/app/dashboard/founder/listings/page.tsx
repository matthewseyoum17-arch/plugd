import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusToggle } from "./_components/StatusToggle";

export default async function MyListings() {
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

  const { data: listings } = await supabase
    .from("listings")
    .select("*, setter_applications(setter_id), appointments(id, status)")
    .eq("company_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">
            Products
          </h1>
          <p className="text-gray-400 mt-2 font-medium">
            Manage the products and services you have listed for setters to
            promote.
          </p>
        </div>
        <Link
          href="/dashboard/founder/listings/new"
          className="px-5 py-2.5 btn-neon font-button font-medium rounded-xl"
        >
          + New Product
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="text-xl font-heading font-semibold text-white mb-2">
            No products yet
          </h3>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">
            Create your first product listing to start receiving applications
            from elite setters.
          </p>
          <Link
            href="/dashboard/founder/listings/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-button font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            Create Product Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => {
            const approvedSetters =
              listing.setter_applications?.filter(
                (a: { setter_id: string }) => a.setter_id,
              ).length || 0;
            const pendingAppts =
              listing.appointments?.filter(
                (a: { status: string }) => a.status === "submitted",
              ).length || 0;

            return (
              <div
                key={listing.id}
                className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-6 hover:border-white/15 transition-all duration-300 flex flex-col shadow-sm hover:shadow-[0_10px_40px_rgba(255,255,255,0.03)] group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-lg font-heading font-semibold text-white truncate group-hover:text-gray-300 transition-colors">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 truncate">
                      {listing.company_name}
                    </p>
                  </div>
                  <StatusBadge status={listing.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-black/40 border border-white/5 rounded-xl p-4 transition-colors group-hover:bg-black/60">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 font-heading">
                      $/Appt
                    </p>
                    <p className="text-accent font-semibold text-xl">
                      $
                      {(
                        (listing.commission_per_appointment || 0) / 100
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-xl p-4 transition-colors group-hover:bg-black/60">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 font-heading">
                      $/Close
                    </p>
                    <p className="text-white font-semibold text-xl">
                      ${((listing.commission_per_close || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 font-medium">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    {approvedSetters} active
                  </span>
                  <span className="text-white/10">|</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    {pendingAppts} pending
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-5 border-t border-glass-border">
                  <div className="flex items-center gap-3">
                    <StatusToggle
                      listingId={listing.id}
                      currentStatus={listing.status}
                    />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {listing.status === "active" ? "Active" : "Paused"}
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/founder/listings/${listing.id}/edit`}
                    className="text-sm font-button font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    Edit <span className="text-lg leading-none">&rarr;</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
