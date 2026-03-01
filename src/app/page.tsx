"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Sparkles,
  CheckCircle2,
  Activity,
  Shield,
  Zap,
  Star,
  Quote,
  Upload,
  Users,
  DollarSign,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

/* ═══════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════ */
const Navbar = () => (
  <motion.nav
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.8, delay: 0.3 }}
    className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4"
  >
    <div className="flex items-center justify-between glass backdrop-blur-xl rounded-full px-6 py-3 shadow-glass-lg">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center group-hover:bg-white/[0.12] transition-all">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-white">
          Plugd
        </span>
      </Link>

      {/* Center Links */}
      <div className="hidden md:flex items-center gap-8">
        {["For Founders", "For Setters", "How it Works"].map((item) => (
          <Link
            key={item}
            href={`#${item.toLowerCase().replace(/ /g, "-")}`}
            className="text-sm font-medium text-gray-500 hover:text-white transition-colors"
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="hidden md:block text-sm font-medium text-gray-500 hover:text-white transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/dashboard/founder"
          className="btn-neon px-5 py-2 text-sm flex items-center gap-1.5"
        >
          Dashboard
          <span className="shimmer-overlay" />
        </Link>
      </div>
    </div>
  </motion.nav>
);

/* ═══════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════ */
const Hero = () => (
  <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-32 overflow-hidden">
    {/* Background Orbs */}
    <div className="absolute top-[40%] left-[30%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/[0.03] rounded-full blur-[140px] pointer-events-none animate-breathe-slow" />
    <div className="absolute top-[50%] right-[20%] -translate-y-1/2 w-[500px] h-[500px] bg-zinc-500/[0.05] rounded-full blur-[140px] pointer-events-none animate-breathe" />

    {/* Subtle Grid Lines */}
    <div className="absolute inset-0 opacity-[0.025] pointer-events-none">
      <div className="w-full h-full" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
    </div>

    {/* Floating Glass Card — Left */}
    <motion.div
      initial={{ opacity: 0, x: -40, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-[35%] left-[8%] lg:left-[12%] glass rounded-2xl p-5 shadow-glass animate-float hidden lg:block"
    >
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.3)]" />
        <span className="font-mono text-xs font-semibold text-gray-400 tracking-wider">
          PLUGD MATCHER v2.0
        </span>
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="h-1.5 w-20 bg-white/15 rounded-full" />
          <div className="h-1.5 w-12 bg-white/25 rounded-full" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="h-1.5 w-24 bg-white/15 rounded-full" />
          <div className="h-1.5 w-8 bg-zinc-400/30 rounded-full" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="h-1.5 w-16 bg-white/15 rounded-full" />
          <div className="h-1.5 w-14 bg-white/20 rounded-full" />
        </div>
      </div>
    </motion.div>

    {/* Floating Glass Card — Right */}
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 1.2, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-[42%] right-[8%] lg:right-[12%] glass rounded-2xl p-4 shadow-glass animate-float hidden lg:block"
      style={{ animationDelay: "3s" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-white" />
        <span className="font-mono text-xs font-medium text-gray-400">
          MEETING BOOKED
        </span>
      </div>
      <div className="text-2xl font-bold text-white">$8,400</div>
      <div className="text-xs text-gray-400 font-medium mt-1">
        ARR value qualified
      </div>
    </motion.div>

    {/* Hero Content */}
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="relative z-10 flex flex-col items-center text-center max-w-5xl px-4"
    >
      {/* Badge */}
      <motion.div
        variants={fadeUp}
        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.05] border border-white/10 mb-8 backdrop-blur-md"
      >
        <Sparkles className="w-4 h-4 text-white" />
        <span className="text-xs font-bold text-gray-300 tracking-[0.15em] uppercase">
          The #1 AI Agent Marketplace
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        variants={fadeUp}
        className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-[-0.03em] leading-[1.05] mb-6"
      >
        <span className="text-gradient-white">The Marketplace for</span>
        <br />
        <span className="text-gradient-neon">AI Agent Sales</span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        variants={fadeUp}
        className="text-lg md:text-xl text-gray-500 max-w-2xl mb-12 font-medium leading-relaxed"
      >
        Connect with elite appointment setters who sell your AI agents on
        commission. Zero retainers. Pay only for qualified meetings.
      </motion.p>

      {/* Dual CTAs */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
      >
        <Link
          href="/signup?role=founder"
          className="group w-full sm:w-auto btn-neon px-8 py-4 text-base flex items-center justify-center gap-2"
        >
          <span className="relative z-10">List Your AI Agent</span>
          <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-0.5 transition-transform" />
          <span className="shimmer-overlay" />
        </Link>
        <Link
          href="/signup?role=setter"
          className="w-full sm:w-auto btn-ghost px-8 py-4 text-base flex items-center justify-center gap-2"
        >
          Apply as Setter
        </Link>
      </motion.div>
    </motion.div>
  </section>
);

/* ═══════════════════════════════════════════════════
   TRUSTED BY
   ═══════════════════════════════════════════════════ */
const trustedNames = ["Vercel", "Linear", "OpenAI", "Cursor", "Zapier", "HubSpot"];

const TrustedBy = () => (
  <section className="py-16 border-y border-glass-border bg-surface/50 backdrop-blur-md overflow-hidden relative">
    {/* Fade Edges */}
    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

    <div className="max-w-7xl mx-auto px-4 text-center mb-8">
      <p className="font-mono text-xs font-semibold text-gray-600 uppercase tracking-[0.2em]">
        Trusted by founders building with
      </p>
    </div>

    <div className="flex animate-marquee">
      {[1, 2, 3, 4].map((set) => (
        <div key={set} className="flex items-center flex-shrink-0 gap-16 px-8">
          {trustedNames.map((name) => (
            <span
              key={`${set}-${name}`}
              className="text-2xl font-bold tracking-tight text-white/20 hover:text-white/50 transition-colors whitespace-nowrap select-none"
            >
              {name}
            </span>
          ))}
        </div>
      ))}
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════ */
const steps = [
  {
    num: "01",
    icon: <Upload className="w-6 h-6" />,
    title: "List Your AI Agent",
    desc: "Describe your product, target market, and ideal meeting profile. Our system indexes everything in seconds.",
  },
  {
    num: "02",
    icon: <Users className="w-6 h-6" />,
    title: "Get Matched With Setters",
    desc: "PLUGD Matcher analyzes your product and pairs you with vetted setters who have proven domain expertise.",
  },
  {
    num: "03",
    icon: <DollarSign className="w-6 h-6" />,
    title: "Pay Per Meeting",
    desc: "Setters book qualified meetings on your calendar. You only pay commission when a meeting actually happens.",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-32 px-4 max-w-7xl mx-auto relative">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[160px] pointer-events-none" />

    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      className="relative z-10"
    >
      <motion.div variants={fadeUp} className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          How <span className="text-gradient-neon">Plugd</span> Works
        </h2>
        <p className="text-gray-500 text-lg font-medium max-w-xl mx-auto">
          Three simple steps from listing to qualified meeting.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <motion.div key={step.num} variants={fadeUp}>
            <GlassCard className="p-10 h-full">
              <span className="font-mono text-sm font-bold text-gray-500 mb-6 block">
                {step.num}
              </span>
              <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center mb-6 text-white">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
              <p className="text-gray-500 leading-relaxed">{step.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

/* ═══════════════════════════════════════════════════
   FEATURES — BENTO GRID
   ═══════════════════════════════════════════════════ */
const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant AI Matching",
    desc: "Our proprietary PLUGD Matcher analyzes your product mechanics and instantly pairs you with setters who have proven domain expertise.",
    span: "md:col-span-2",
    large: true,
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Elite Vetted Setters",
    desc: "Top 3% acceptance rate. We thoroughly vet every setter for track record, communication skills, and professionalism.",
    span: "",
    large: false,
  },
  {
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: "Pay Only For Results",
    desc: "Zero retainers. Zero setup fees. You only pay commission when a qualified meeting is booked on your calendar.",
    span: "",
    large: false,
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "Live Dashboard",
    desc: "Track pipeline health, meeting conversions, and commission payouts in real-time with full transparency across the network.",
    span: "md:col-span-2",
    large: true,
  },
];

const Features = () => (
  <section id="for-founders" className="py-32 px-4 max-w-7xl mx-auto relative">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/[0.01] blur-[120px] pointer-events-none" />

    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      className="relative z-10"
    >
      <motion.div variants={fadeUp} className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gradient-white">
          Engineered for Scale
        </h2>
        <p className="text-gray-500 text-lg font-medium">
          Everything you need to fill your pipeline with highly qualified meetings.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className={cn(
              f.span,
              "group relative bg-glass-bg backdrop-blur-2xl border border-glass-border rounded-[2rem] p-10 overflow-hidden",
              "transition-all duration-300",
              "hover:border-white/15 hover:shadow-[0_0_40px_rgba(255,255,255,0.03)]",
              "hover:-translate-y-1"
            )}
          >
            {/* Large background icon for wide cards */}
            {f.large && (
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 group-hover:scale-110">
                {f.title === "Live Dashboard" ? (
                  <Activity className="w-48 h-48 text-white" />
                ) : (
                  <Bot className="w-48 h-48 text-white" />
                )}
              </div>
            )}

            {/* Dashboard Preview for Live Dashboard card */}
            {f.title === "Live Dashboard" && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-glass-bg via-transparent to-transparent z-[1]" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2/3 h-4/5 border-y border-l border-white/10 rounded-l-2xl bg-background/80 backdrop-blur-xl p-6 opacity-30 group-hover:opacity-60 transition-all duration-500 group-hover:translate-x-[-10px] shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                    </div>
                    <div className="h-3 w-20 bg-white/10 rounded-full" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 w-1/3 bg-white/15 rounded" />
                        <div className="h-2 w-1/4 bg-white/10 rounded" />
                      </div>
                      <div className="h-5 w-14 bg-white/10 rounded-full" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 w-2/5 bg-white/15 rounded" />
                        <div className="h-2 w-1/3 bg-white/10 rounded" />
                      </div>
                      <div className="h-5 w-14 bg-white/[0.06] rounded-full" />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div
              className={cn(
                "relative z-10 flex flex-col justify-end",
                f.large ? "min-h-[300px]" : "min-h-[280px]"
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center mb-6 text-white">
                {f.icon}
              </div>
              <h3
                className={cn(
                  "font-bold mb-3",
                  f.large ? "text-3xl mb-4" : "text-2xl"
                )}
              >
                {f.title}
              </h3>
              <p
                className={cn(
                  "text-gray-500 leading-relaxed",
                  f.large ? "max-w-md text-lg" : ""
                )}
              >
                {f.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

/* ═══════════════════════════════════════════════════
   LIVE PULSE
   ═══════════════════════════════════════════════════ */
const pulseEntries = [
  { tag: "MATCH", color: "text-white", text: "SaaS Founder <> Enterprise Setter (San Francisco)" },
  { tag: "BOOKED", color: "text-gray-400", text: "$12k ARR Meeting Scheduled via HubSpot" },
  { tag: "SYSTEM", color: "text-gray-600", text: "PLUGD Matcher v2.0 analyzed 1,240 profiles" },
  { tag: "MATCH", color: "text-white", text: "AI Agency <> B2B Closer (London)" },
  { tag: "PAYOUT", color: "text-white", text: "Commission cleared — $1,850 to Setter Wallet" },
  { tag: "BOOKED", color: "text-gray-400", text: "$5k Retainer Meeting Scheduled via Google Calendar" },
  { tag: "MATCH", color: "text-white", text: "Fintech Startup <> Outbound Specialist (NYC)" },
  { tag: "SYSTEM", color: "text-gray-600", text: "Network uptime: 99.97% — 0 disputes open" },
  { tag: "PAYOUT", color: "text-white", text: "Commission cleared — $2,400 to Setter Wallet" },
  { tag: "BOOKED", color: "text-gray-400", text: "$28k ARR Enterprise Demo Confirmed" },
];

const LivePulse = () => (
  <section className="py-24 bg-background border-y border-glass-border relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/[0.015] blur-[100px] pointer-events-none" />

    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16 relative z-10"
    >
      <motion.div variants={fadeUp} className="md:w-1/3">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 mb-6">
          <Activity className="w-5 h-5 text-white animate-pulse" />
          <span className="text-sm font-bold text-gray-300 tracking-widest uppercase">
            Live Pulse
          </span>
        </div>
        <h3 className="text-3xl font-extrabold mb-4 tracking-tight text-white">
          Marketplace Activity
        </h3>
        <p className="text-gray-500 font-medium leading-relaxed">
          Real-time kernel log of matches, bookings, and payouts across the Plugd
          network.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="md:w-2/3 w-full">
        <GlassCard
          hover={false}
          className="p-6 font-mono text-sm shadow-glass-lg h-[300px] overflow-hidden relative border-white/10"
        >
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-surface to-transparent z-10 pointer-events-none" />

          <div className="space-y-4 opacity-80 group-hover:opacity-100 transition-opacity animate-float">
            {pulseEntries.map((entry, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={cn("font-bold shrink-0", entry.color)}>
                  [{entry.tag}]
                </span>
                <span className={entry.tag === "BOOKED" ? "text-white" : "text-gray-400"}>
                  {entry.text}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  </section>
);

/* ═══════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════ */
const testimonials = [
  {
    name: "Sarah J.",
    role: "CEO, TechFlow AI",
    quote:
      "Plugd connected us with a setter who understood our highly technical product immediately. 15 qualified enterprise meetings in month one.",
    metric: "+320% ROI",
  },
  {
    name: "Marcus T.",
    role: "Founder, ScaleB2B",
    quote:
      "The zero-retainer model completely de-risked our outbound motion. We only pay when the meeting happens. It's a no-brainer.",
    metric: "48hrs to first demo",
  },
];

const Testimonials = () => (
  <section className="py-24 bg-surface/30 border-y border-glass-border relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-zinc-500/[0.02] blur-[120px] pointer-events-none" />

    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      className="max-w-7xl mx-auto px-4 relative z-10"
    >
      <motion.div variants={fadeUp} className="flex items-center gap-3 mb-12">
        <Star className="w-6 h-6 text-white fill-white" />
        <h2 className="text-3xl font-extrabold tracking-tight">
          Founder Success
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((t, i) => (
          <motion.div key={i} variants={fadeUp}>
            <GlassCard className="p-10 relative group border-white/10 hover:border-white/15">
              <Quote className="absolute top-8 right-8 w-12 h-12 text-white/[0.03] group-hover:text-white/[0.06] transition-colors" />

              <div className="mb-8">
                <span className="inline-block px-4 py-1.5 rounded-full font-mono text-sm font-bold bg-white/[0.06] border border-white/10 text-white">
                  {t.metric}
                </span>
              </div>

              <p className="text-xl text-gray-400 font-medium leading-relaxed mb-8 relative z-10">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-zinc-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-background" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-sm text-gray-600">{t.role}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

/* ═══════════════════════════════════════════════════
   CTA + FOOTER
   ═══════════════════════════════════════════════════ */
const FooterCTA = () => (
  <footer className="relative border-t border-glass-border pt-40 pb-10 overflow-hidden bg-background">
    {/* Glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[400px] bg-white/[0.03] blur-[160px] pointer-events-none" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      className="max-w-4xl mx-auto px-4 text-center mb-40 relative z-10"
    >
      <motion.h2
        variants={fadeUp}
        className="text-5xl md:text-7xl font-extrabold tracking-[-0.03em] mb-8 text-gradient-white"
      >
        Ready to plug in?
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-xl text-gray-500 font-medium mb-12 max-w-2xl mx-auto"
      >
        Join the exclusive network of elite founders and top-tier appointment
        setters.
      </motion.p>

      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row items-center justify-center gap-6"
      >
        <Link
          href="/signup?role=founder"
          className="group w-full sm:w-auto btn-neon px-12 py-5 text-lg flex items-center justify-center gap-2"
        >
          <span className="relative z-10">List Your AI Agent</span>
          <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          <span className="shimmer-overlay" />
        </Link>
        <Link
          href="/signup?role=setter"
          className="w-full sm:w-auto btn-ghost px-12 py-5 text-lg flex items-center justify-center"
        >
          Apply as Setter
        </Link>
      </motion.div>
    </motion.div>

    {/* Giant Watermark */}
    <div className="relative z-10 w-full overflow-hidden mb-12 flex justify-center px-4">
      <span className="text-[20vw] font-black tracking-tighter text-white/[0.02] select-none leading-[0.8] pointer-events-none">
        PLUGD
      </span>
    </div>

    {/* Footer Bar */}
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-gray-600 text-sm font-medium">
      <div className="flex items-center gap-3">
        <Bot className="w-5 h-5 text-gray-600" />
        <p>&copy; 2026 Plugd Inc. All rights reserved.</p>
      </div>
      <div className="flex gap-8 mt-6 md:mt-0">
        <Link href="#" className="hover:text-white transition-colors">
          Twitter
        </Link>
        <Link href="#" className="hover:text-white transition-colors">
          LinkedIn
        </Link>
        <Link href="#" className="hover:text-white transition-colors">
          Terms
        </Link>
        <Link href="#" className="hover:text-white transition-colors">
          Privacy
        </Link>
      </div>
    </div>
  </footer>
);

/* ═══════════════════════════════════════════════════
   PAGE EXPORT
   ═══════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <main className="min-h-screen relative selection:bg-white/15">
      <Navbar />
      <Hero />
      <TrustedBy />
      <HowItWorks />
      <Features />
      <LivePulse />
      <Testimonials />
      <FooterCTA />
    </main>
  );
}
