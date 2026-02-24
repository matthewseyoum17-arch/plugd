"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateSetterProfile } from "@/app/actions-profile";
import { MapPin, Linkedin, Briefcase, Save, CheckCircle } from "lucide-react";

const inp = "w-full px-4 py-3 bg-[#111] border border-[#1a1a1a] rounded-xl focus:outline-none focus:border-[#00FF94]/50 focus:ring-1 focus:ring-[#00FF94]/50 text-white text-sm placeholder:text-gray-600 transition-all";
const lbl = "block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2";

export default function SetterProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [industries, setIndustries] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const meta = user.user_metadata || {};
      setFullName(
        meta.full_name || (meta.first_name && meta.last_name ? `${meta.first_name} ${meta.last_name}` : user.email?.split("@")[0] || "")
      );

      const { data: profile } = await supabase
        .from("setter_profiles")
        .select("*")
        .eq("setter_id", user.id)
        .single();

      if (profile) {
        setHeadline(profile.headline || "");
        setBio(profile.bio || "");
        setIndustries(profile.industries || "");
        setLocation(profile.location || "");
        setLinkedinUrl(profile.linkedin_url || "");
      }
      setLoading(false);
    };
    load();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    const result = await updateSetterProfile({
      headline,
      bio,
      industries,
      location,
      linkedin_url: linkedinUrl,
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

  const initials = fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-white mb-1">My Profile</h1>
      <p className="text-gray-500 text-sm mb-8">This is visible to founders when you apply to their listings.</p>

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
          <p className="text-white font-semibold text-lg">{fullName}</p>
          <p className="text-gray-500 text-sm">Setter</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className={lbl}>Headline</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g., B2B Appointment Setter | SaaS & Healthcare"
              maxLength={120}
              className={`${inp} pl-10`}
            />
          </div>
          <p className="text-gray-600 text-xs mt-1">{headline.length}/120</p>
        </div>

        <div>
          <label className={lbl}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell founders about your experience, approach, and track record..."
            maxLength={1000}
            className={`${inp} h-32 resize-none`}
          />
          <p className="text-gray-600 text-xs mt-1">{bio.length}/1000</p>
        </div>

        <div>
          <label className={lbl}>Industries / Verticals</label>
          <input
            type="text"
            value={industries}
            onChange={(e) => setIndustries(e.target.value)}
            placeholder="e.g., SaaS, Healthcare, Real Estate, Legal"
            className={inp}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, NY"
                className={`${inp} pl-10`}
              />
            </div>
          </div>
          <div>
            <label className={lbl}>LinkedIn URL</label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className={`${inp} pl-10`}
              />
            </div>
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
