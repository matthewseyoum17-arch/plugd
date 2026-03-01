"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Eye, EyeOff, Zap, Users, BarChart3, Bot } from "lucide-react";

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
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

const features = [
  {
    icon: <Zap className="w-5 h-5 text-white" />,
    title: "Elite Network",
    description: "Access vetted appointment setters with proven track records.",
  },
  {
    icon: <Users className="w-5 h-5 text-gray-400" />,
    title: "Instant Matching",
    description: "Get matched with the perfect setter for your product within hours.",
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-white" />,
    title: "Real-time Analytics",
    description: "Track appointments, conversions, and revenue in real-time.",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      let role = data.user.user_metadata?.role;
      try {
        const { data: userRow } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();
        if (userRow?.role) role = userRow.role;
      } catch {
        // users row may not exist yet
      }
      router.push(`/dashboard/${role || "setter"}`);
    }
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
          <div className="inline-flex items-center justify-center p-3 bg-white/[0.06] border border-white/10 rounded-2xl mb-6 backdrop-blur-md">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Sign in to Plugd
          </h1>
          <p className="text-gray-500 text-sm">
            Where founders meet elite appointment setters.
          </p>
        </motion.div>

        {/* Glass Card */}
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="bg-glass-bg backdrop-blur-2xl border border-glass-border rounded-3xl p-8 shadow-glass-lg"
        >
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

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <motion.div variants={itemVars} className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="floating-input"
                required
                placeholder="name@company.com"
              />
              <label htmlFor="email" className="floating-label">
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
                className="floating-input pr-12"
                required
                placeholder="••••••••"
              />
              <label htmlFor="password" className="floating-label">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </motion.div>

            {/* Remember + Forgot */}
            <motion.div variants={itemVars} className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-black/40 text-white focus:ring-white/30 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-500 select-none">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </motion.div>

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
                {loading ? "Authenticating..." : "Sign In"}
                {!loading && <span className="opacity-70">&rarr;</span>}
              </span>
              <div className="shimmer-overlay" />
            </motion.button>

            {/* Divider */}
            <motion.div variants={itemVars} className="relative py-4 flex items-center">
              <div className="flex-grow border-t border-white/10" />
              <span className="px-4 text-xs text-gray-600 uppercase tracking-wider">Or continue with</span>
              <div className="flex-grow border-t border-white/10" />
            </motion.div>

            {/* Google */}
            <motion.button
              variants={itemVars}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.99 }}
              type="button"
              className="w-full py-3.5 px-4 bg-white/[0.02] border border-white/10 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-3 hover:border-white/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </motion.button>
          </form>

          <motion.p variants={itemVars} className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-white hover:text-gray-300 font-medium transition-colors">
              Request access
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Bottom Teaser */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="w-full max-w-5xl mt-24 mb-12 relative z-10 hidden md:block"
      >
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-gray-500 tracking-[0.2em] uppercase mb-2">
            The Plugd Advantage
          </p>
          <h2 className="text-xl text-gray-500 font-light">
            Built for the next generation of AI sales.
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.12)" }}
              className="p-6 rounded-2xl bg-glass-bg backdrop-blur-xl border border-glass-border transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center mb-4 border border-white/10">
                {feature.icon}
              </div>
              <h3 className="text-white font-medium mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
