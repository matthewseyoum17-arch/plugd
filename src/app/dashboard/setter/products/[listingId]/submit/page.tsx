"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";

interface Listing {
  id: string;
  title: string;
  company_id: string;
  commission_per_appointment: number;
  commission_per_close: number;
  founder_profiles?: {
    company_name: string;
  };
}

const inputClass =
  "w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/15 text-white placeholder:text-gray-600 transition-all";

export default function SubmitAppointment() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [appointmentType, setAppointmentType] = useState<
    "appointment" | "close"
  >("appointment");
  const [notes, setNotes] = useState("");

  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const listingId = params.listingId as string;

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const role = user.user_metadata?.role;
      if (role !== "setter") {
        router.push("/dashboard/founder");
      }

      const { data: listingData } = await supabase
        .from("listings")
        .select("*, founder_profiles(company_name)")
        .eq("id", listingId)
        .single();

      setListing(listingData);
      setLoading(false);
    };
    checkUser();
  }, [router, supabase, listingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: application } = await supabase
        .from("setter_applications")
        .select("*")
        .eq("setter_id", user.id)
        .eq("listing_id", listingId)
        .eq("status", "approved")
        .single();

      if (!application) {
        throw new Error(
          "You do not have an approved application for this listing",
        );
      }

      const { error: insertError } = await supabase
        .from("appointments")
        .insert({
          setter_id: user.id,
          listing_id: listingId,
          company_id: listing?.company_id,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_company: contactCompany,
          appointment_type: appointmentType,
          notes: notes,
          status: "submitted",
        });

      if (insertError) throw insertError;

      router.push("/dashboard/setter/appointments");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit appointment",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-t-2 border-white animate-spin mb-4" />
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-gray-400">Listing not found</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-heading font-semibold text-white tracking-tight mb-2">Submit Appointment</h1>
      <p className="text-gray-400 mb-8 font-medium">
        Promoting: <span className="text-white">{listing.title}</span> by{" "}
        {listing.founder_profiles?.company_name}
      </p>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-8">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-button font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Contact Name *
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={inputClass}
              required
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-button font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputClass}
              required
              placeholder="john@company.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-button font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Contact Company *
          </label>
          <input
            type="text"
            value={contactCompany}
            onChange={(e) => setContactCompany(e.target.value)}
            className={inputClass}
            required
            placeholder="Acme Corp"
          />
        </div>

        <div>
          <label className="block text-xs font-button font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Appointment Type *
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${appointmentType === "appointment" ? "border-white bg-white/15" : "border-gray-600 group-hover:border-gray-400"}`}
              >
                {appointmentType === "appointment" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>
              <input
                type="radio"
                name="appointmentType"
                value="appointment"
                checked={appointmentType === "appointment"}
                onChange={() => setAppointmentType("appointment")}
                className="hidden"
              />
              <span className="text-white text-sm font-medium">
                Qualified Meeting ($
                {((listing.commission_per_appointment || 0) / 100).toFixed(2)})
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${appointmentType === "close" ? "border-white bg-white/15" : "border-gray-600 group-hover:border-gray-400"}`}
              >
                {appointmentType === "close" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>
              <input
                type="radio"
                name="appointmentType"
                value="close"
                checked={appointmentType === "close"}
                onChange={() => setAppointmentType("close")}
                className="hidden"
              />
              <span className="text-white text-sm font-medium">
                Closed Deal ($
                {((listing.commission_per_close || 0) / 100).toFixed(2)})
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-button font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} h-24`}
            placeholder="Any additional context about this appointment..."
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 btn-neon rounded-xl font-button font-semibold disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Appointment"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
