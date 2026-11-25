import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ebf5ff",
          100: "#d4eaff",
          200: "#aed8ff",
          300: "#75bdff",
          400: "#2fa3ff",
          500: "#0d7ef5",
          600: "#0660cf",
          700: "#054aa3",
          800: "#073b82",
          900: "#0a2f66",
          950: "#071e42",
        },
        navy: {
          800: "#0c182e",
          900: "#071021",
          950: "#040914",
        },
      },
      boxShadow: {
        "brand-glow": "0 12px 30px -6px rgba(13, 126, 245, 0.48)",
        "glass-card":
          "0 20px 44px -14px rgba(13, 126, 245, 0.22), 0 8px 20px -6px rgba(15, 23, 42, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)",
        "glass-float":
          "0 28px 56px -14px rgba(13, 126, 245, 0.30), 0 12px 24px -8px rgba(15, 23, 42, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)",
      },
    },
  },
  plugins: [],
};
export default config;
