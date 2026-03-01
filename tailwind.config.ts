import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        heading: ["var(--font-inter)", "sans-serif"],
        button: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        background: "#0a0f1a",
        surface: "#0f172a",
        "surface-light": "#1e293b",
        primary: "#00ff9d",
        "primary-hover": "#00e68a",
        accent: "#06b6d4",
        neon: "#00ff9d",
        cyan: "#06b6d4",
        "glass-bg": "rgba(15,23,42,0.65)",
        "glass-border": "rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00ff9d 0%, #06b6d4 100%)',
        'neon-gradient-r': 'linear-gradient(to right, #00ff9d, #06b6d4)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0,255,157,0.15)',
        'neon-lg': '0 0 40px rgba(0,255,157,0.2)',
        'neon-xl': '0 0 60px rgba(0,255,157,0.25)',
        'cyan': '0 0 20px rgba(6,182,212,0.15)',
        'cyan-lg': '0 0 40px rgba(6,182,212,0.2)',
        'glass': '0 8px 32px rgba(0,0,0,0.4)',
        'glass-lg': '0 16px 48px rgba(0,0,0,0.5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
        'breathe-slow': 'breathe 12s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%) skewX(12deg)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.15)', opacity: '0.6' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
