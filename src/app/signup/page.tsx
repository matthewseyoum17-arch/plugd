"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Eye, EyeOff, Bot, Rocket, Target } from "lucide-react";

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVars: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function SignupPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "founder" ? "founder" : "setter";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"founder" | "setter">(initialRole as "founder" | "setter");
  const [companyName, setCompanyName] = useState("");
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
          role: role,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("users").insert({
        id: data.user.id,
        email,
        full_name: `${firstName} ${lastName}`,
        role,
      });

      if (role === "founder") {
        await supabase.from("founder_profiles").insert({
          founder_id: data.user.id,
          company_name: companyName || "My Company",
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 my-auto">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-3 bg-neon/[0.08] border border-neon/20 rounded-2xl mb-6 backdrop-blur-md shadow-neon">
            <Bot className="w-7 h-7 text-neon" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Join Plugd
          </h1>
          <p className="text-gray-400 text-sm">
            Start selling AI agents or close deals today.
          </p>
        </motion.div>

        {/* Glass Card */}
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="bg-glass-bg backdrop-blur-2xl border border-glass-border rounded-3xl p-8 shadow-glass-lg"
        >
          {/* Role Toggle — Segmented Control */}
          <motion.div variants={itemVars} className="mb-8">
            <div className="relative flex bg-black/30 rounded-xl p-1 border border-white/[0.06]">
              {/* Sliding indicator */}
              <motion.div
                className="absolute top-1 bottom-1 rounded-lg bg-neon/[0.12] border border-neon/25 shadow-neon"
                animate={{ left: role === "founder" ? "4px" : "50%" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{ width: "calc(50% - 4px)" }}
              />
              <button
                type="button"
                onClick={() => setRole("founder")}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  role === "founder" ? "text-neon" : "text-gray-400 hover:text-white"
                }`}
              >
                <Rocket className="w-4 h-4" />
                Founder
              </button>
              <button
                type="button"
                onClick={() => setRole("setter")}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  role === "setter" ? "text-neon" : "text-gray-400 hover:text-white"
                }`}
              >
                <Target className="w-4 h-4" />
                Setter
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              {role === "founder"
                ? "List your AI agents and connect with elite setters"
                : "Browse AI products and earn commissions on qualified meetings"}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Name row */}
            <motion.div variants={itemVars} className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="floating-input"
                  required
                  placeholder="John"
                />
                <label htmlFor="firstName" className="floating-label">First Name</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="floating-input"
                  required
                  placeholder="Doe"
                />
                <label htmlFor="lastName" className="floating-label">Last Name</label>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVars} className="relative">
              <input
                type="email"
                id="signupEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="floating-input"
                required
                placeholder="name@company.com"
              />
              <label htmlFor="signupEmail" className="floating-label">Email address</label>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVars} className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="signupPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="floating-input pr-12"
                required
                minLength={6}
                placeholder="••••••••"
              />
              <label htmlFor="signupPassword" className="floating-label">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-neon transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </motion.div>

            {/* Company Name (founder only) */}
            <AnimatePresence>
              {role === "founder" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <input
                    type="text"
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="floating-input"
                    placeholder="Acme AI"
                  />
                  <label htmlFor="companyName" className="floating-label">Company Name</label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              variants={itemVars}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 btn-neon text-base relative group disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Creating account..." : `Create ${role === "founder" ? "Founder" : "Setter"} Account`}
                {!loading && <span className="opacity-70">&rarr;</span>}
              </span>
              <div className="shimmer-overlay" />
            </motion.button>
          </form>

          <motion.p variants={itemVars} className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:text-neon font-medium transition-colors">
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
