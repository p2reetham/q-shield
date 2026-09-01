/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#0c0d0f",
          900: "#141619",
          850: "#191c20",
          800: "#1f2328",
          700: "#2a2f36",
          600: "#3a4048",
          500: "#565e68",
        },
        offwhite: "#e9e7e0",
        amber: {
          400: "#e8a33d",
          500: "#d78d24",
          600: "#b8720f",
        },
        cyan: {
          300: "#7fe7e0",
          400: "#4dd8ce",
          500: "#28bdb2",
        },
        danger: "#d1493f",
        safe: "#4c9a6a",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(233,231,224,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(233,231,224,0.035) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
    },
  },
  plugins: [],
};
