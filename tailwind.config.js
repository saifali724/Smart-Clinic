/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },

      colors: {
        clinic: {
          page: "#070B15",
          panel: "#121827",
          card: "#151B2B",
          cardSoft: "#161D2E",
          border: "#24324D",

          primary: "#00D4E9",
          cyan: "#10BCD1",
          green: "#3CF3A7",

          heading: "#EEF4FC",
          text: "#DCE6F3",
          muted: "#8B96AA",
          faint: "#59657B",

          danger: "#FF5C7A",
        },
      },

      boxShadow: {
        loginCard: "0 30px 100px rgba(0, 0, 0, 0.30)",
        tealGlow: "0 0 70px rgba(0, 212, 233, 0.18)",
      },
    },
  },
  plugins: [],
};