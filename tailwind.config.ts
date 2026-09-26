import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        obsidian: {
          950: "#05070B",
          900: "#0B0F17",
          850: "#0F1622",
          800: "#131C2E",
          700: "#1E293B",
          600: "#334155",
        },
        cyber: {
          cyan: "#06B6D4",
          violet: "#8B5CF6",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(6, 182, 212, 0.25)",
        "glow-violet": "0 0 25px -5px rgba(139, 92, 246, 0.25)",
        "glow-emerald": "0 0 25px -5px rgba(16, 185, 129, 0.25)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "orb-float": "orbFloat 4s ease-in-out infinite",
        "wave-bounce": "waveBounce 1.2s ease-in-out infinite alternate",
      },
      keyframes: {
        orbFloat: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-8px) scale(1.03)" },
        },
        waveBounce: {
          "0%": { height: "15%" },
          "100%": { height: "95%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
