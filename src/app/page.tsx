import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { BackgroundVideo } from '@/components/ui/BackgroundVideo'
import { 
  Command,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '#services', hasDropdown: true },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Contact us', href: '#contact' }
]

const badges = [
  { icon: BarChart3, label: 'Analytics Ready' },
  { icon: MessageSquare, label: 'Instant Messaging' },
  { icon: Settings, label: 'Customizable' }
]

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans overflow-hidden relative">
      
      {/* Video Background Container */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 z-10 bg-black/60 pointer-events-none" />
        <BackgroundVideo 
          src="https://customer-cbeadsgr09pnsezs.cloudflarestream.com/257c7359efd4b4aaebcc03aa8fc78a36/manifest/video.m3u8"
          poster="https://customer-cbeadsgr09pnsezs.cloudflarestream.com/257c7359efd4b4aaebcc03aa8fc78a36/thumbnails/thumbnail.jpg"
          className="w-full h-full object-cover scale-105"
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group z-50">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <Command className="w-5 h-5 text-black" />
            </div>
            <span className="font-heading font-semibold tracking-tight text-xl">Datacore</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link, i) => (
              <Link 
                key={i} 
                href={link.href}
                className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
                {link.hasDropdown && <ChevronDown className="w-4 h-4 text-gray-500" />}
              </Link>
            ))}
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4 z-50">
            <div className="hidden md:flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-5 py-2.5 text-sm font-button font-medium text-white bg-glass-bg border border-glass-border rounded-full hover:bg-white/10 transition-colors backdrop-blur-md"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="px-5 py-2.5 text-sm font-button font-medium text-white bg-primary rounded-full hover:bg-primary-hover transition-colors shadow-[0_0_20px_rgba(123,57,252,0.3)]"
              >
                Get Started
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
              {link.hasDropdown && <ChevronDown className="w-6 h-6 text-gray-500" />}
            </Link>
          ))}
          <div className="flex flex-col gap-4 mt-8 w-full max-w-xs px-6">
            <Link 
              href="/login" 
              className="w-full py-4 text-center text-lg font-button font-medium text-white bg-glass-bg border border-glass-border rounded-xl"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="w-full py-4 text-center text-lg font-button font-medium text-white bg-primary rounded-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      {/* Hero Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <motion.div 
          className="max-w-5xl w-full flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8 inline-flex items-center gap-3 p-1.5 pr-4 rounded-full bg-glass-bg border border-glass-border backdrop-blur-md">
            <span className="px-2.5 py-1 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-wider">NEW</span>
            <span className="text-sm font-medium text-gray-200">Say Hello to Datacore v3.2</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="font-heading text-5xl md:text-[76px] font-bold tracking-tight leading-[1.05] mb-8"
          >
            Your Networks.<br/>
            One Rapid <span className="font-serif italic text-white/90">Interface</span>.
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            variants={itemVariants}
            className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed mb-12 font-medium"
          >
            Platform helps admins control access, logs, and servers with purpose.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-4 text-base font-button font-medium text-white bg-primary rounded-xl hover:bg-primary-hover transition-all shadow-[0_0_30px_rgba(123,57,252,0.2)] hover:shadow-[0_0_40px_rgba(123,57,252,0.4)] hover:-translate-y-0.5"
            >
              Book a Free Demo
            </Link>
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-4 text-base font-button font-medium text-white bg-secondary border border-white/5 rounded-xl hover:bg-secondary-hover transition-all hover:-translate-y-0.5"
            >
              Get Started Now
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
