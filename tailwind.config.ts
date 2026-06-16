import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: "#D4A843",
        brown: "#6B3A1F",
        ink: "#1A1A1A"
      },
      boxShadow: {
        luxe: "0 20px 60px rgba(0,0,0,.18)"
      },
      backgroundImage: {
        "luxury-radial":
          "radial-gradient(circle at top, rgba(212,168,67,0.18), transparent 40%), linear-gradient(180deg, #ffffff 0%, #f8f5ee 100%)"
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "serif"],
        body: ["var(--font-inter)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
