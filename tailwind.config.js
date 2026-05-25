/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      colors: {
        bg: "#0a0f1e",
        surface: "#131929",
        accent: "#00e5ff",
      },
    },
  },
  plugins: [],
};
