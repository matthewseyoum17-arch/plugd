"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "founder" ? "founder" : "setter";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState<"founder" | "setter">(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role,
          ...(role === "founder" ? { company_name: companyName } : {}),
        },
      },
    });
    if (authError) { setError(authError.message); setLoading(false); return; }

    if (data.user) {
      const fullName = `${firstName} ${lastName}`.trim() || email.split("@")[0] || "User";

      // Create public.users row immediately so it exists before any redirect
      const { error: insertErr } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        role,
      });
      if (insertErr && !insertErr.message.includes("duplicate")) {
        console.error("Error creating users row on signup:", insertErr);
      }

      // Create role-specific profile
      if (role === "founder") {
        await supabase.from("founder_profiles").insert({
          founder_id: data.user.id,
          company_name: companyName || null,
        });
      } else {
        await supabase.from("setter_profiles").insert({
          setter_id: data.user.id,
        });
      }

      router.push(`/dashboard/${role}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Plugd</h1>
          <p className="text-gray-400">Create your account</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
          {error && <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">I am a...</label>
              <div className="flex gap-4">
                {(["founder","setter"] as const).map((r) => (
                  <label key={r} className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${role===r ? "border-[#00FF94] bg-[#00FF94]/10" : "border-[#2a2a2a]"}`}>
                    <input type="radio" name="role" value={r} checked={role===r} onChange={() => setRole(r)} className="sr-only" />
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white capitalize">{r}</div>
                      <div className="text-xs text-gray-400 mt-1">{r==="founder" ? "List your product" : "Promote products"}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            {role === "founder" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="Acme AI"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#00FF94] text-white" />
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 bg-[#00FF94] text-black font-semibold rounded-lg hover:bg-[#00cc76] transition-colors disabled:opacity-50">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00FF94] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
