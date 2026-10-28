import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aicte: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc7fb",
          400: "#36aaf5",
          500: "#0c8ee4",
          600: "#0170c2",
          700: "#025a9e",
          800: "#074c82",
          900: "#0c406d",
          950: "#082949",
        },
        navy: {
          800: "#0f172a",
          900: "#0b1222",
          950: "#070c17",
        }
      },
    },
  },
  plugins: [],
};
export default config;

