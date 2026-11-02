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
        // Obsidian Cyber Studio Tokens (Optimized Deep Midnight Cyber palette)
        surface: "#0B0D13",
        "surface-dim": "#0B0D13",
        "surface-bright": "#1A2030",
        "surface-container-lowest": "#06070B",
        "surface-container-low": "#0F121C",
        "surface-container": "#141724",
        "surface-container-high": "#1A2032",
        "surface-container-highest": "#222A40",
        "on-surface": "#F1F5F9",
        "on-surface-variant": "#94A3B8",
        outline: "#222A40",
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
          bg: "#0B0D13",
          card: "#141724",
          border: "#222A40",
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