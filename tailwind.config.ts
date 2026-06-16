import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F6F3EA",
        lime: "#C4F542",
        ink: "#0E0E0E",
        paper: "#FFFFFF",
        line: "#E8E3D5",
        coral: "#FF6B5E",
      },
      fontFamily: {
        // Wired to the CSS variable set by next/font in app/layout.tsx.
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-instrument-serif)", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        xl: "36rem",
      },
    },
  },
  plugins: [],
};

export default config;
