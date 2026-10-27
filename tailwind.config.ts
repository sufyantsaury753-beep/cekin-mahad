import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        uin: {
          primary: "#0D5C3A", // Islamic Green (Syekh Nurjati Theme)
          secondary: "#0A482E",
          accent: "#D4AF37", // Gold accent
          dark: "#083321",
          light: "#E8F5E9",
          muted: "#F0FDF4"
        }
      }
    },
  },
  plugins: [],
};
export default config;
