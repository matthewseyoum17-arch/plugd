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

      // Fetch listing details
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

      // Verify setter has approved application for this listing
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Listing not found</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Submit Appointment</h1>
      <p className="text-gray-400 mb-8">
        Promoting: <span className="text-white">{listing.title}</span> by{" "}
        {listing.founder_profiles?.company_name}
      </p>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contact Name *
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
              required
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
              required
              placeholder="john@company.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contact Company *
          </label>
          <input
            type="text"
            value={contactCompany}
            onChange={(e) => setContactCompany(e.target.value)}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white"
            required
            placeholder="Acme Corp"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Appointment Type *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="appointmentType"
                value="appointment"
                checked={appointmentType === "appointment"}
                onChange={() => setAppointmentType("appointment")}
                className="w-4 h-4 accent-[#00FF94]"
              />
              <span className="text-white">
                Qualified Meeting ($
                {((listing.commission_per_appointment || 0) / 100).toFixed(2)})
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="appointmentType"
                value="close"
                checked={appointmentType === "close"}
                onChange={() => setAppointmentType("close")}
                className="w-4 h-4 accent-[#00FF94]"
              />
              <span className="text-white">
                Closed Deal ($
                {((listing.commission_per_close || 0) / 100).toFixed(2)})
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white h-24"
            placeholder="Any additional context about this appointment..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-[#00FF94] text-black font-medium rounded-lg hover:bg-[#00cc76] transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Appointment"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-[#1a1a1a] text-gray-300 border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
