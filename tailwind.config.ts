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
        sans: ["var(--font-manrope)", "sans-serif"],
        heading: ["var(--font-inter)", "sans-serif"],
        button: ["var(--font-cabin)", "sans-serif"],
        serif: ["var(--font-instrument)", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#7b39fc',
          hover: '#6a2ce0'
        },
        secondary: {
          DEFAULT: '#2b2344',
          hover: '#352b54'
        },
        accent: '#f87b52',
        glass: {
          border: 'rgba(164,132,215,0.5)',
          bg: 'rgba(85,80,110,0.4)'
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        'glass-gradient': 'linear-gradient(180deg, rgba(85,80,110,0.4) 0%, rgba(43,35,68,0.2) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x': 'gradient-x 10s ease infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'shimmer': {
          '100%': {
            'transform': 'translateX(100%)'
          }
        }
      }
    },
  },
  plugins: [],
};
export default config;
