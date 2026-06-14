/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2937",
        paper: "#f8f7f4",
        accent: "#1d4ed8",
        accentSoft: "#dbeafe",
        line: "#d6d3d1",
      },
      boxShadow: {
        card: "0 8px 30px rgba(28, 25, 23, 0.08)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
