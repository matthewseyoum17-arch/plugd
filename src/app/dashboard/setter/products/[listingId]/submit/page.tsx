"use client";
import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { submitAppointment } from "@/app/actions";

export default function SubmitAppointment() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [appointmentType, setAppointmentType] = useState<"appointment"|"close">("appointment");
  const [meetingDate, setMeetingDate] = useState("");
  const [contactLinkedin, setContactLinkedin] = useState("");
  const [contactWebsite, setContactWebsite] = useState("");
  const [notes, setNotes] = useState("");

  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const listingId = params.listingId as string;

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      if (user.user_metadata?.role !== "setter") { router.push("/dashboard/founder"); return; }
      const { data } = await supabase
        .from("listings")
        .select("*, founder_profiles(company_name)")
        .eq("id", listingId)
        .maybeSingle();
      setListing(data);
      setLoading(false);
    };
    load();
  }, [listingId, router, supabase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await submitAppointment({
        listing_id: listingId,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_company: contactCompany,
        calendly_event_url: calendlyUrl,
        appointment_type: appointmentType,
        meeting_date: meetingDate || undefined,
        contact_linkedin: contactLinkedin || undefined,
        contact_website: contactWebsite || undefined,
        notes,
      });
      if (result.error) setError(result.error);
      else router.push("/dashboard/setter/appointments");
    });
  };

  const inp = "w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#ffffff] text-white";
  const lbl = "block text-sm font-medium text-gray-300 mb-2";

  if (loading) return <div className="text-white py-20 text-center">Loading...</div>;
  if (!listing) return <div className="text-white py-20 text-center">Listing not found.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Submit Appointment</h1>
      <p className="text-gray-400 mb-8">
        Promoting: <span className="text-white">{listing.title}</span>
        {listing.founder_profiles?.company_name && ` · ${listing.founder_profiles.company_name}`}
      </p>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Contact Name *</label>
            <input type="text" value={contactName} onChange={e=>setContactName(e.target.value)} required className={inp} placeholder="Jane Smith" />
          </div>
          <div>
            <label className={lbl}>Contact Email *</label>
            <input type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} required className={inp} placeholder="jane@company.com" />
          </div>
        </div>
        <div>
          <label className={lbl}>Contact Company *</label>
          <input type="text" value={contactCompany} onChange={e=>setContactCompany(e.target.value)} required className={inp} placeholder="Acme Corp" />
        </div>
        <div>
          <label className={lbl}>Calendly Event Link * <span className="text-gray-500 font-normal">(proof of booking)</span></label>
          <input type="url" value={calendlyUrl} onChange={e=>setCalendlyUrl(e.target.value)} required className={inp} placeholder="https://calendly.com/events/..." />
        </div>
        <div>
          <label className={lbl}>Appointment Type *</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="appointment" checked={appointmentType==="appointment"} onChange={()=>setAppointmentType("appointment")} className="w-4 h-4 accent-[#ffffff]" />
              <span className="text-white">Qualified Meeting (${((listing.commission_per_appointment||0)/100).toFixed(2)})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="close" checked={appointmentType==="close"} onChange={()=>setAppointmentType("close")} className="w-4 h-4 accent-[#ffffff]" />
              <span className="text-white">Closed Deal (${((listing.commission_per_close||0)/100).toFixed(2)})</span>
            </label>
          </div>
        </div>
        <div>
          <label className={lbl}>Meeting Date <span className="text-gray-500 font-normal">(optional)</span></label>
          <input type="datetime-local" value={meetingDate} onChange={e=>setMeetingDate(e.target.value)} className={inp} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Contact LinkedIn <span className="text-gray-500 font-normal">(optional)</span></label>
            <input type="url" value={contactLinkedin} onChange={e=>setContactLinkedin(e.target.value)} className={inp} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className={lbl}>Contact Website <span className="text-gray-500 font-normal">(optional)</span></label>
            <input type="url" value={contactWebsite} onChange={e=>setContactWebsite(e.target.value)} className={inp} placeholder="https://company.com" />
          </div>
        </div>
        <div>
          <label className={lbl}>Notes <span className="text-gray-500 font-normal">(optional)</span></label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} className={`${inp} h-24`} placeholder="Any context about this lead..." />
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={isPending}
            className="px-6 py-3 bg-[#ffffff] text-black font-semibold rounded-lg hover:bg-[#00cc76] transition-colors disabled:opacity-50">
            {isPending ? "Submitting..." : "Submit Appointment"}
          </button>
          <button type="button" onClick={()=>router.back()}
            className="px-6 py-3 bg-[#1a1a1a] text-gray-300 border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
