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
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc5fb",
          400: "#36a3f7",
          500: "#0c87eb",
          600: "#026ac9",
          700: "#0354a2",
          800: "#074885",
          900: "#0c3d6f",
          950: "#082649",
        },
        navy: {
          800: "#0f172a",
          900: "#0b1120",
          950: "#060a12",
        },
      },
    },
  },
  plugins: [],
};
export default config;
