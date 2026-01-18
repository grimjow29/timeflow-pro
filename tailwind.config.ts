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
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        background: "#0f0a1a",
        surface: "#1a1225",
        surfaceHighlight: "#251838",
        primary: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          900: "#4c1d95",
        },
        accent: "#a855f7",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(139, 92, 246, 0.15)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
