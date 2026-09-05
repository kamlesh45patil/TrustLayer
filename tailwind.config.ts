import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
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
        razorpay: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0c83fd',
          600: '#0066f5',
          700: '#0052cc',
          800: '#023c99',
          900: '#0b2046',
        }
      },
    },
  },
  plugins: [],
};
export default config;
