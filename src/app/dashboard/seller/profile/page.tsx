"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SellerProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUsername(user.user_metadata?.username || "");
      setFullName(user.user_metadata?.full_name || "");

      // Try to load from users table
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUsername(profile.username || user.user_metadata?.username || "");
        setFullName(profile.full_name || user.user_metadata?.full_name || "");
      }

      // Try setter_profiles as fallback for bio/location
      const { data: setterProfile } = await supabase
        .from("setter_profiles")
        .select("*")
        .eq("setter_id", user.id)
        .single();

      if (setterProfile) {
        setBio(setterProfile.bio || "");
        setLocation(setterProfile.location || "");
      }

      setLoading(false);
    }
    loadProfile();
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Update auth metadata
    await supabase.auth.updateUser({
      data: { full_name: fullName, username },
    });

    // Update users table
    await supabase
      .from("users")
      .update({ full_name: fullName, username })
      .eq("id", user.id);

    // Upsert setter_profiles for bio/location
    await supabase.from("setter_profiles").upsert({
      setter_id: user.id,
      bio,
      location,
      headline: "",
    });

    setMessage("Profile updated successfully.");
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[var(--cta)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass =
    "w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-hint)] focus:outline-none focus:ring-2 focus:ring-[var(--cta)]";

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
        Profile
      </h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell buyers about yourself..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
            className={inputClass}
          />
        </div>

        {message && (
          <p className="text-sm text-[var(--cta)]">{message}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[var(--cta)] text-white font-medium text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
