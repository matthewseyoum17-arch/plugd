'use client'

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Command, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Insights", href: "#insights" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30 font-sans overflow-hidden relative">
      {/* Abstract Wave Background Image */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-80"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          backgroundRepeat: 'no-repeat',
          mixBlendMode: 'screen',
          filter: 'grayscale(100%) contrast(1.2) brightness(1.1)',
        }}
      />
      
      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-black/20 via-black/40 to-black" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group z-50">
            <Command className="w-6 h-6 text-white" />
            <span className="font-heading font-medium tracking-tight text-xl">
              Pluggd
            </span>
          </Link>

          {/* Desktop Links (Pill Shape) */}
          <div className="hidden md:flex items-center gap-8 bg-white/5 border border-white/10 rounded-full px-8 py-3 backdrop-blur-md">
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4 z-50">
            <div className="hidden md:flex items-center">
              <Link
                href="/signup"
                className="px-6 py-2.5 text-sm font-medium text-black bg-white rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get Started for Free
              </Link>
            </div>
            <button
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center space-y-8">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-heading font-medium text-white flex items-center gap-2"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-4 mt-8 w-full max-w-xs px-6">
            <Link
              href="/signup"
              className="w-full py-4 text-center text-lg font-medium text-black bg-white rounded-xl"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      )}

      {/* Hero Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-end pb-32 px-6">
        <motion.div
          className="max-w-4xl w-full flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-heading text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-6"
          >
            Where Innovation<br />Meets Execution
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-gray-300/80 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 font-normal"
          >
            Connect top-tier founders with elite appointment setters. We ensure a smooth launch with rigorous matching. Post-launch, continuously analyze performance.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-black bg-white rounded-lg hover:bg-gray-100 transition-all"
            >
              Get Started for Free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-white bg-white/10 border border-white/10 rounded-lg hover:bg-white/20 transition-all backdrop-blur-md"
            >
              Let&apos;s Get Connected
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
