"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Eye, EyeOff, Rocket, TrendingUp, Zap } from "lucide-react";

const BackgroundOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.08, 0.18, 0.08],
        x: [0, 60, 0],
        y: [0, -40, 0],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-[#00FF94]/10 rounded-full blur-[120px]"
    />
    <motion.div
      animate={{
        scale: [1, 1.4, 1],
        opacity: [0.05, 0.12, 0.05],
        x: [0, -50, 0],
        y: [0, 50, 0],
      }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-[#0088ff]/10 rounded-full blur-[130px]"
    />
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.04, 0.1, 0.04],
      }}
      transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#7722cc]/10 rounded-full blur-[100px]"
    />
  </div>
);

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030305] flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const initialRole =
    searchParams.get("role") === "founder" ? "founder" : "setter";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    const fullName =
      `${firstName} ${lastName}`.trim() || email.split("@")[0] || "User";

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          name: fullName,
          role,
          ...(role === "founder" ? { company_name: companyName } : {}),
        },
      },
    });

    if (authError) {
      if (authError.message.includes("Database error")) {
        setError(
          "Account setup failed. Please try again or contact support."
        );
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      // Create public.users row — use upsert to avoid conflicts with any DB trigger
      await supabase.from("users").upsert(
        {
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          role,
        },
        { onConflict: "id" }
      );

      // Create role-specific profile (ignore duplicates)
      if (role === "founder") {
        await supabase
          .from("founder_profiles")
          .upsert(
            { founder_id: data.user.id, company_name: companyName || null },
            { onConflict: "founder_id" }
          );
      } else {
        await supabase
          .from("setter_profiles")
          .upsert(
            { setter_id: data.user.id },
            { onConflict: "setter_id" }
          );
      }

      router.push(`/dashboard/${role}`);
    }
    setLoading(false);
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-[#00FF94]/30">
      <BackgroundOrbs />

      <div className="w-full max-w-md relative z-10 my-auto">
        {/* Logo / Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-3 bg-white/[0.03] border border-white/10 rounded-2xl mb-6 shadow-inner backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FF94] to-[#0088ff] flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Create your account
          </h1>
          <p className="text-gray-400 text-sm">
            Join the marketplace for B2B growth.
          </p>
        </motion.div>

        {/* Main Glass Card */}
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]"
        >
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Role Toggle */}
            <motion.div variants={itemVars}>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["founder", "setter"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`relative p-4 rounded-xl border transition-all duration-300 text-left overflow-hidden group ${
                      role === r
                        ? "border-[#00FF94]/40 bg-[#00FF94]/[0.06] shadow-[0_0_20px_rgba(0,255,148,0.08)]"
                        : "border-white/[0.06] bg-black/30 hover:border-white/[0.12] hover:bg-white/[0.02]"
                    }`}
                  >
                    {role === r && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00FF94] shadow-[0_0_8px_rgba(0,255,148,0.6)]" />
                    )}
                    <div
                      className={`text-sm font-semibold mb-1 ${
                        role === r ? "text-white" : "text-gray-300"
                      }`}
                    >
                      {r === "founder" ? "List Products" : "Set Appointments"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {r === "founder"
                        ? "I'm a founder with a B2B product"
                        : "I book meetings for commissions"}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Name Fields */}
            <motion.div variants={itemVars} className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Jane"
                  className="peer w-full px-4 pt-6 pb-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[#00FF94]/50 focus:ring-1 focus:ring-[#00FF94]/50 text-white transition-all placeholder-transparent text-sm"
                />
                <label
                  htmlFor="firstName"
                  className="absolute left-4 top-2 text-[10px] font-medium text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-[#00FF94]/70"
                >
                  First name
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Smith"
                  className="peer w-full px-4 pt-6 pb-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[#00FF94]/50 focus:ring-1 focus:ring-[#00FF94]/50 text-white transition-all placeholder-transparent text-sm"
                />
                <label
                  htmlFor="lastName"
                  className="absolute left-4 top-2 text-[10px] font-medium text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-[#00FF94]/70"
                >
                  Last name
                </label>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVars} className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="jane@company.com"
                className="peer w-full px-4 pt-6 pb-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[#00FF94]/50 focus:ring-1 focus:ring-[#00FF94]/50 text-white transition-all placeholder-transparent text-sm"
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-2 text-[10px] font-medium text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-[#00FF94]/70"
              >
                Email address
              </label>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVars} className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="peer w-full px-4 pt-6 pb-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[#00FF94]/50 focus:ring-1 focus:ring-[#00FF94]/50 text-white transition-all placeholder-transparent pr-12 text-sm"
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-2 text-[10px] font-medium text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-[#00FF94]/70"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </motion.div>

            {/* Company Name (Founder only) */}
            <AnimatePresence>
              {role === "founder" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative overflow-hidden"
                >
                  <div className="relative">
                    <input
                      type="text"
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      placeholder="Acme AI"
                      className="peer w-full px-4 pt-6 pb-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[#00FF94]/50 focus:ring-1 focus:ring-[#00FF94]/50 text-white transition-all placeholder-transparent text-sm"
                    />
                    <label
                      htmlFor="companyName"
                      className="absolute left-4 top-2 text-[10px] font-medium text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-[#00FF94]/70"
                    >
                      Company name
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              variants={itemVars}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#00FF94] to-[#0088ff] hover:from-[#00ff94]/90 hover:to-[#0088ff]/90 text-black font-semibold rounded-xl transition-all shadow-[0_0_24px_rgba(0,255,148,0.25)] disabled:opacity-50 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <span className="text-black/60">&rarr;</span>}
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />
            </motion.button>
          </form>

          <motion.p
            variants={itemVars}
            className="mt-8 text-center text-sm text-gray-500"
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-white hover:text-[#00FF94] font-medium transition-colors"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Bottom Teaser Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="w-full max-w-5xl mt-20 mb-12 relative z-10 hidden md:block"
      >
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-[#00FF94] tracking-[0.2em] uppercase mb-2">
            Why Plugd
          </p>
          <h2 className="text-xl text-gray-400 font-light">
            Built for modern B2B growth teams.
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {[
            {
              icon: <Rocket className="w-5 h-5 text-[#00FF94]" />,
              title: "Launch Fast",
              description:
                "List your product in minutes and start receiving qualified meeting requests.",
            },
            {
              icon: <TrendingUp className="w-5 h-5 text-[#0088ff]" />,
              title: "Pay for Results",
              description:
                "Commission-based payouts mean you only pay when meetings actually happen.",
            },
            {
              icon: <Zap className="w-5 h-5 text-[#7722cc]" />,
              title: "Scale Revenue",
              description:
                "Access a network of vetted setters who know how to book qualified demos.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{
                y: -5,
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm transition-all"
            >
              <div
                className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center mb-4 border border-white/[0.08]"
              >
                {feature.icon}
              </div>
              <h3 className="text-white font-medium mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Shimmer animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%) skewX(12deg); }
        }
      `,
        }}
      />
    </div>
  );
}
