import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Mediterranean theme colors
        sand: "#F5F1EB",
        sage: "#B0C4B1",
        terra: "#D98064",
        clay: "#D4A373",
        linen: "#F7F5F0",
        // Cycle Tracker phase colors
        rose: "#E2C2C6",     // Menstrual
        peach: "#F5DBCE",    // Follicular
        lavender: "#C8B6CD", // Luteal
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
