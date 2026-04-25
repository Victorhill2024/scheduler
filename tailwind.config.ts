import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // Crescere brand
        forest: {
          DEFAULT: "#0D3B3B",
          50: "#E6F0EF",
          100: "#C2D8D6",
          200: "#9BBFBC",
          300: "#74A6A2",
          400: "#4D8D88",
          500: "#0D3B3B",
          600: "#0B3232",
          700: "#082828",
          800: "#061F1F",
          900: "#031010",
        },
        cream: {
          DEFAULT: "#FAF3E8",
          50: "#FFFDF9",
          100: "#FAF3E8",
          200: "#F2E5CC",
          300: "#E9D6AF",
        },
        gold: {
          DEFAULT: "#E8A838",
          50: "#FCF1DC",
          100: "#F8E1B0",
          200: "#F3CD81",
          300: "#EDB851",
          400: "#E8A838",
          500: "#C88B22",
          600: "#A26F1A",
        },
        // Functional
        background: "#FAF3E8",
        foreground: "#1a1a1a",
        muted: { DEFAULT: "#F2E5CC", foreground: "#5C5C5C" },
        border: "#E0E0E0",
        input: "#E0E0E0",
        ring: "#0D3B3B",
        primary: { DEFAULT: "#0D3B3B", foreground: "#FAF3E8" },
        secondary: { DEFAULT: "#E8A838", foreground: "#1a1a1a" },
        destructive: { DEFAULT: "#B3261E", foreground: "#FFFFFF" },
        accent: { DEFAULT: "#E8A838", foreground: "#1a1a1a" },
        card: { DEFAULT: "#FFFDF9", foreground: "#1a1a1a" },
        popover: { DEFAULT: "#FFFDF9", foreground: "#1a1a1a" },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Manrope", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
