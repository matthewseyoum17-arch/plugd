"use client";
import { useState, useEffect, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toggleListingStatus } from "@/app/actions";

const inp = "w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg focus:outline-none focus:border-[#00FF94] text-white placeholder:text-gray-600";
const lbl = "block text-sm font-medium text-gray-300 mb-2";

export default function EditListing() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const listingId = params.listingId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState("active");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [idealCustomer, setIdealCustomer] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [apptComm, setApptComm] = useState("");
  const [closeComm, setCloseComm] = useState("");
  const [meetingDef, setMeetingDef] = useState("");
  const [pitchKit, setPitchKit] = useState("");
  const [maxSetters, setMaxSetters] = useState("5");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: listing } = await supabase.from("listings").select("*").eq("id", listingId).maybeSingle();
      if (!listing || listing.company_id !== user.id) { router.push("/dashboard/founder/listings"); return; }
      setTitle(listing.title || "");
      setDescription(listing.description || "");
      setIdealCustomer(listing.ideal_customer || "");
      setProductUrl(listing.product_url || "");
      setApptComm(((listing.commission_per_appointment || 0) / 100).toString());
      setCloseComm(((listing.commission_per_close || 0) / 100).toString());
      setMeetingDef(listing.qualified_meeting_definition || "");
      setPitchKit(listing.pitch_kit_url || "");
      setMaxSetters((listing.max_setters || 5).toString());
      setStatus(listing.status || "active");
      setLoading(false);
    };
    load();
  }, [listingId, router, supabase]);

  const commissionTooLow = parseFloat(apptComm || "0") < 25;

  const handleSave = async () => {
    if (commissionTooLow) { setError("Minimum commission per appointment is $25.00"); return; }
    setSaving(true);
    setError("");
    const { error } = await supabase.from("listings").update({
      title, description,
      ideal_customer: idealCustomer,
      product_url: productUrl,
      commission_per_appointment: Math.round(parseFloat(apptComm || "0") * 100),
      commission_per_close: Math.round(parseFloat(closeComm || "0") * 100),
      qualified_meeting_definition: meetingDef,
      pitch_kit_url: pitchKit,
      max_setters: parseInt(maxSetters || "5", 10),
    }).eq("id", listingId);
    if (error) setError(error.message);
    else { setSuccess(true); setTimeout(() => router.push("/dashboard/founder/listings"), 800); }
    setSaving(false);
  };

  const handleToggle = () => {
    const next = status === "active" ? "paused" : "active";
    startTransition(async () => {
      const result = await toggleListingStatus(listingId, next);
      if (!result.error) setStatus(next);
    });
  };

  if (loading) return <div className="text-gray-400 py-20 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Edit Listing</h1>
          <p className="text-gray-500">Update your product listing details.</p>
        </div>
        <button onClick={handleToggle} disabled={isPending}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${status==="active" ? "border-red-800 text-red-400 hover:bg-red-900/20" : "border-green-800 text-green-400 hover:bg-green-900/20"}`}>
          {isPending ? "..." : status === "active" ? "Pause Listing" : "Activate Listing"}
        </button>
      </div>
      {error && <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 mb-6">{error}</div>}
      {success && <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg text-green-400 mb-6">Saved!</div>}
      <div className="space-y-6">
        <div><label className={lbl}>Product Title *</label><input type="text" value={title} onChange={e=>setTitle(e.target.value)} className={inp} required /></div>
        <div><label className={lbl}>Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} className={`${inp} h-32`} /></div>
        <div><label className={lbl}>Ideal Customer</label><input type="text" value={idealCustomer} onChange={e=>setIdealCustomer(e.target.value)} className={inp} /></div>
        <div><label className={lbl}>Product URL</label><input type="url" value={productUrl} onChange={e=>setProductUrl(e.target.value)} className={inp} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Commission per Appointment ($) *</label>
            <input type="number" step="0.01" min="25" value={apptComm} onChange={e=>setApptComm(e.target.value)} className={inp} />
            {commissionTooLow && <p className="text-red-400 text-xs mt-1">Minimum $25.00</p>}
            {!commissionTooLow && apptComm && <p className="text-gray-500 text-xs mt-1">Setter earns ${(parseFloat(apptComm) * 0.93).toFixed(2)} after 7% fee</p>}
          </div>
          <div><label className={lbl}>Commission per Close ($)</label><input type="number" step="0.01" min="0" value={closeComm} onChange={e=>setCloseComm(e.target.value)} className={inp} /></div>
        </div>
        <div>
          <label className={lbl}>Max Active Setters</label>
          <input type="number" min="1" max="50" value={maxSetters} onChange={e=>setMaxSetters(e.target.value)} className={inp} />
          <p className="text-xs text-gray-500 mt-1">Extra applicants go to waitlist when this cap is reached.</p>
        </div>
        <div><label className={lbl}>Qualified Meeting Definition</label><textarea value={meetingDef} onChange={e=>setMeetingDef(e.target.value)} className={`${inp} h-24`} /></div>
        <div><label className={lbl}>Pitch Kit URL</label><input type="url" value={pitchKit} onChange={e=>setPitchKit(e.target.value)} className={inp} /></div>
      </div>
      <div className="flex gap-4 mt-8">
        <button onClick={handleSave} disabled={saving || !title.trim()}
          className="px-6 py-3 bg-[#00FF94] text-black font-semibold rounded-lg hover:brightness-90 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button onClick={() => router.push("/dashboard/founder/listings")} className="px-6 py-3 text-gray-500 hover:text-gray-300 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
