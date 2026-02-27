"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username,
          role,
        },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        setError(
          "An account with this email already exists. Please sign in instead."
        );
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="max-w-md w-full">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <p className="font-bold text-2xl text-[var(--foreground)]">
              GigFlow
            </p>
          </div>

          {/* Heading */}
          <h1 className="text-xl font-semibold text-[var(--foreground)] mb-6">
            Create your account
          </h1>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-[var(--foreground-muted)] text-sm mb-1.5"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Jane Smith"
                className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--foreground)] w-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-[var(--foreground-muted)] text-sm mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="janesmith"
                className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--foreground)] w-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[var(--foreground-muted)] text-sm mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--foreground)] w-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[var(--foreground-muted)] text-sm mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--foreground)] w-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-[var(--foreground-muted)] text-sm mb-2">
                How will you use GigFlow?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("buyer")}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    role === "buyer"
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={role === "buyer"}
                    onChange={() => setRole("buyer")}
                    className="sr-only"
                  />
                  <p
                    className={`text-sm font-medium ${
                      role === "buyer"
                        ? "text-[var(--foreground)]"
                        : "text-[var(--foreground-muted)]"
                    }`}
                  >
                    I want to buy services
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("seller")}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    role === "seller"
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={role === "seller"}
                    onChange={() => setRole("seller")}
                    className="sr-only"
                  />
                  <p
                    className={`text-sm font-medium ${
                      role === "seller"
                        ? "text-[var(--foreground)]"
                        : "text-[var(--foreground-muted)]"
                    }`}
                  >
                    I want to sell services
                  </p>
                </button>
              </div>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--cta)] text-white rounded-lg py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-[var(--foreground-muted)] text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[var(--accent)] hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
