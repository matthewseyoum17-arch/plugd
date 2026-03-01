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
        background: "#09090b",
        surface: "#18181b",
        "surface-light": "#27272a",
        primary: "#ffffff",
        "primary-hover": "#e4e4e7",
        accent: "#a1a1aa",
        neon: "#ffffff",
        cyan: "#a1a1aa",
        "glass-bg": "rgba(24,24,27,0.65)",
        "glass-border": "rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'neon-gradient': 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
        'neon-gradient-r': 'linear-gradient(to right, #ffffff, #a1a1aa)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(255,255,255,0.06)',
        'neon-lg': '0 0 40px rgba(255,255,255,0.08)',
        'neon-xl': '0 0 60px rgba(255,255,255,0.1)',
        'cyan': '0 0 20px rgba(161,161,170,0.1)',
        'cyan-lg': '0 0 40px rgba(161,161,170,0.12)',
        'glass': '0 8px 32px rgba(0,0,0,0.5)',
        'glass-lg': '0 16px 48px rgba(0,0,0,0.6)',
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
