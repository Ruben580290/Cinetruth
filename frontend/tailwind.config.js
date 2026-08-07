/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141414",
        cream: "#FFF8E7",
        paper: "#FFFDF5",
        hotpink: "#FF2DAA",
        pink: "#FF6BCB",
        electric: "#FFE600",
        cyan: "#00E5FF",
        violet: "#8B5CF6",
        orange: "#FF6B1A",
        lime: "#B8FF2C",
        danger: "#FF3B30",
        muted: "#665F72",
      },
      fontFamily: {
        display: ["'Bowlby One SC'", "Impact", "sans-serif"],
        comic: ["'Bangers'", "Impact", "cursive"],
        body: ["'Space Grotesk'", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
      },
      boxShadow: {
        brutal: "8px 8px 0 #141414",
        "brutal-sm": "4px 4px 0 #141414",
        "brutal-pink": "8px 8px 0 #FF2DAA",
        "brutal-cyan": "8px 8px 0 #00E5FF",
        "brutal-yellow": "8px 8px 0 #FFE600",
      },
      backgroundImage: {
        dots: "radial-gradient(#141414 1.35px, transparent 1.35px)",
        "comic-grid": "linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)",
        rays: "repeating-conic-gradient(from 0deg, #FFE600 0deg 12deg, #FFF8E7 12deg 24deg)",
      },
    },
  },
  plugins: [],
};
