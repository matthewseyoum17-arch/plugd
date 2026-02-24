"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateFounderProfile } from "@/app/actions-profile";
import { MapPin, Globe, Building, Save, CheckCircle } from "lucide-react";

const inp = "w-full px-4 py-3 bg-[#111] border border-[#1a1a1a] rounded-xl focus:outline-none focus:border-[#00FF94]/50 focus:ring-1 focus:ring-[#00FF94]/50 text-white text-sm placeholder:text-gray-600 transition-all";
const lbl = "block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2";

export default function FounderProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const meta = user.user_metadata || {};
      setFullName(
        meta.full_name || (meta.first_name && meta.last_name ? `${meta.first_name} ${meta.last_name}` : user.email?.split("@")[0] || "")
      );

      const { data: profile } = await supabase
        .from("founder_profiles")
        .select("*")
        .eq("founder_id", user.id)
        .maybeSingle();

      if (profile) {
        setCompanyName(profile.company_name || "");
        setHeadline(profile.headline || "");
        setBio(profile.bio || "");
        setWebsite(profile.website || "");
        setLocation(profile.location || "");
        setIndustry(profile.industry || "");
      }
      setLoading(false);
    };
    load();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    const result = await updateFounderProfile({
      company_name: companyName,
      headline,
      bio,
      website,
      location,
      industry,
    });
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (loading) return <div className="text-gray-400 py-20 text-center">Loading...</div>;

  const initials = (companyName || fullName).split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-white mb-1">Company Profile</h1>
      <p className="text-gray-500 text-sm mb-8">This is visible to setters when they browse your listings.</p>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-400 text-sm mb-6">{error}</div>
      )}
      {saved && (
        <div className="p-4 bg-green-900/20 border border-green-800 rounded-xl text-green-400 text-sm mb-6 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Profile saved
        </div>
      )}

      {/* Avatar + Name */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00FF94]/20 to-[#0088ff]/20 border border-white/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-white">{initials}</span>
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{companyName || fullName}</p>
          <p className="text-gray-500 text-sm">Founder</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className={lbl}>Company Name</label>
          <div className="relative">
            <Building className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Inc." className={`${inp} pl-10`} />
          </div>
        </div>

        <div>
          <label className={lbl}>Headline</label>
          <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g., AI-powered receptionist for healthcare" maxLength={120} className={inp} />
          <p className="text-gray-600 text-xs mt-1">{headline.length}/120</p>
        </div>

        <div>
          <label className={lbl}>About your company</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What does your company do? What problem do you solve?" maxLength={1000} className={`${inp} h-32 resize-none`} />
          <p className="text-gray-600 text-xs mt-1">{bio.length}/1000</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Industry</label>
            <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., Healthcare SaaS" className={inp} />
          </div>
          <div>
            <label className={lbl}>Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., San Francisco, CA" className={`${inp} pl-10`} />
            </div>
          </div>
        </div>

        <div>
          <label className={lbl}>Website</label>
          <div className="relative">
            <Globe className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourcompany.com" className={`${inp} pl-10`} />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-8 flex items-center gap-2 px-6 py-3 bg-[#00FF94] text-black font-semibold rounded-xl hover:brightness-90 disabled:opacity-50 transition-all text-sm"
      >
        <Save className="w-4 h-4" />
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
