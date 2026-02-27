import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "bg-secondary": "var(--background-secondary)",
        foreground: "var(--foreground)",
        "fg-muted": "var(--foreground-muted)",
        "fg-hint": "var(--foreground-hint)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        cta: "var(--cta)",
        "cta-hover": "var(--cta-hover)",
        card: "var(--card)",
        star: "var(--star)",
        warm: "var(--warm)",
        destructive: "var(--destructive)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
        light: "var(--border-light)",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
