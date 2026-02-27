"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message === "Invalid login credentials") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    setMagicLinkLoading(true);
    setError("");

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
    });

    if (otpError) {
      setError(otpError.message);
      setMagicLinkLoading(false);
      return;
    }

    setError("");
    setMagicLinkLoading(false);
    alert("Check your email for a magic link to sign in.");
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
            Welcome back
          </h1>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="Enter your password"
                className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--foreground)] w-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent)] text-white rounded-lg py-3 font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-[var(--border)]" />
            <span className="px-3 text-[var(--foreground-muted)] text-sm">
              or
            </span>
            <div className="flex-1 border-t border-[var(--border)]" />
          </div>

          {/* Magic Link Button */}
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={magicLinkLoading}
            className="w-full border border-[var(--border)] rounded-lg py-3 text-[var(--foreground)] hover:bg-[var(--background)] transition-colors disabled:opacity-50"
          >
            {magicLinkLoading
              ? "Sending magic link..."
              : "Sign in with Magic Link"}
          </button>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-[var(--foreground-muted)] text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[var(--accent)] hover:underline font-medium"
            >
              Join GigFlow
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
