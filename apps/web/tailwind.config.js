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
        // Midnight Slate Cyber Studio Tokens (Deep Slate Blue, non-black dark mode)
        surface: "#0F172A",
        "surface-dim": "#0F172A",
        "surface-bright": "#243248",
        "surface-container-lowest": "#0A0F1D",
        "surface-container-low": "#141F35",
        "surface-container": "#1E293B",
        "surface-container-high": "#28364F",
        "surface-container-highest": "#334155",
        "on-surface": "#F8FAFC",
        "on-surface-variant": "#94A3B8",
        outline: "#334155",
        primary: "#ffb3b6",
        "primary-container": "#FE2C55",
        "on-primary-container": "#5b0015",
        secondary: "#affffb",
        "secondary-container": "#05ece7",
        "secondary-fixed": "#00F5D4",
        tertiary: "#dec800",
        "tertiary-fixed": "#fde400",
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",

        // Studio Legacy aliases
        studio: {
          bg: "#0F172A",
          card: "#1E293B",
          border: "#334155",
          accent: "#FE2C55",
          cyan: "#00F5D4",
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