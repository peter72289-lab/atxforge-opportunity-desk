import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0b",
          50: "#f4f4f5",
          100: "#e4e4e7",
          200: "#a1a1aa",
          300: "#71717a",
          400: "#52525b",
          500: "#3f3f46",
          600: "#27272a",
          700: "#1c1c1f",
          800: "#141416",
          900: "#0a0a0b",
        },
        ember: {
          DEFAULT: "#ff5c1a",
          soft: "#ff7a45",
          deep: "#e04500",
          glow: "rgba(255, 92, 26, 0.35)",
          muted: "rgba(255, 92, 26, 0.12)",
        },
        chalk: "#f5f2eb",
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        ember: "0 0 40px rgba(255, 92, 26, 0.25)",
        card: "0 20px 50px rgba(0,0,0,0.45)",
        drawer: "-20px 0 60px rgba(0,0,0,0.55)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-ember":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,92,26,0.18), transparent)",
      },
    },
  },
  plugins: [],
};
export default config;
