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
        studio: {
          bg: "#09090b",
          card: "#121215",
          border: "#27272a",
          accent: "#fe2c55",
          cyan: "#25f4ee",
        },
      },
    },
  },
  plugins: [],
};
