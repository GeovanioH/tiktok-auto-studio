/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Obsidian Cyber Studio Tokens (from Stitch Design System)
        surface: "#111318",
        "surface-dim": "#111318",
        "surface-bright": "#37393f",
        "surface-container-lowest": "#0c0e13",
        "surface-container-low": "#1a1b21",
        "surface-container": "#1e1f25",
        "surface-container-high": "#282a2f",
        "surface-container-highest": "#33353a",
        "on-surface": "#e2e2e9",
        "on-surface-variant": "#94a3b8",
        outline: "#5d3f40",
        primary: "#ffb3b6",
        "primary-container": "#ff5168",
        "on-primary-container": "#5b0015",
        secondary: "#affffb",
        "secondary-container": "#05ece7",
        "secondary-fixed": "#35fbf5",
        tertiary: "#dec800",
        "tertiary-fixed": "#fde400",
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",

        // Studio Legacy aliases
        studio: {
          bg: "#111318",
          card: "#1a1b21",
          border: "#33353a",
          accent: "#ff5168",
          cyan: "#35fbf5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        headline: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        mono: ["Inter", "monospace"],
      },
      keyframes: {
        shine: {
          "0%": { backgroundPosition: "100% 0" },
          "100%": { backgroundPosition: "-100% 0" },
        },
        "border-beam": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        shine: "shine 4s linear infinite",
        "border-beam": "border-beam 6s linear infinite",
      },
    },
  },
  plugins: [],
};